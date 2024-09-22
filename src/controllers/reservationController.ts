import axios from 'axios'
import { Request, Response } from 'express'
import Reservation from '../models/reservation'
import Property from '../models/Property'
import User from '../models/user'
import { check, validationResult } from 'express-validator'
import { getRedisClient } from '../config/redis/redisClient'
import CancellationPolicy from '../models/cancellationPolicy'
import { applyReservationFilters } from '../reservationFilters'
import { sendPayment } from '../services/paymentService'

const redisClient = getRedisClient()

redisClient.on('error', (err) => {
  console.error('Redis error:', err)
})

export const createReservation = async (req: Request, res: Response) => {
  await check('propertyId').notEmpty().run(req)
  await check('checkIn').isISO8601().run(req)
  await check('checkOut').isISO8601().run(req)
  await check('adults').isInt({ min: 1, max: 20 }).run(req)
  await check('children').isInt({ min: 0, max: 20 }).run(req)

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { propertyId, checkIn, checkOut, adults, children } = req.body

  try {
    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    if (adults + children > property.adults + property.children) {
      return res.status(400).json({
        error: 'The number of occupants exceeds the capacity of the property',
      })
    }

    const startDate = new Date(checkIn)
    const endDate = new Date(checkOut)

    const isAvailable = property.availability.every((day) => {
      const date = new Date(day.date)
      return !(date >= startDate && date <= endDate && day.available === false)
    })

    if (!isAvailable) {
      return res
        .status(400)
        .json({ error: 'The property is not available for the selected dates' })
    }

    const user = await User.findByPk(req.uid)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const newReservation = await Reservation.create({
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      document: user.document,
      documentType: user.documentType,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: 'pending',
    })

    // Actualizar la disponibilidad en el calendario
    property.availability.forEach((day) => {
      const date = new Date(day.date)
      if (date >= startDate && date < endDate) {
        day.available = false
      }
    })

    await property.save()

    // Invalidar el caché después de crear una reserva
    await redisClient.flushAll()

    // Publicar el evento de reserva creada en Redis
    await redisClient.publish(
      'reservationCreated',
      JSON.stringify(newReservation),
    )

    res.status(201).json(newReservation)
  } catch (error: any) {
    console.error('Error creating reservation:', error)
    res
      .status(500)
      .json({ error: 'Error creating reservation', details: error.message })
  }
}

export const cancelReservation = async (req: Request, res: Response) => {
  const { email } = req.body
  const { reservationId } = req.params

  try {
    const reservation = await Reservation.findByPk(reservationId)

    if (!reservation || reservation.email !== email) {
      return res
        .status(404)
        .json({ error: 'Reservation not found or email does not match' })
    }

    const property = await Property.findById(reservation.propertyId)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    // Normalizar el nombre del país a minúsculas
    const countryNormalized = property.country.toLowerCase()

    // Buscar la política de cancelación correspondiente al país, ignorando mayúsculas/minúsculas
    const policy = await CancellationPolicy.findOne({
      country: { $regex: new RegExp(`^${countryNormalized}$`, 'i') },
    })

    if (!policy) {
      return res.status(500).json({
        error: 'Cancellation policy not found for the property country',
      })
    }

    const daysBeforeCheckIn =
      (new Date(reservation.checkIn).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
    let refundPercentage = 0
    if (daysBeforeCheckIn > policy.daysBefore) {
      refundPercentage = policy.refundPercentage
    }

    // Marcar las fechas de la reserva como disponibles en el calendario de la propiedad
    const checkInDate = new Date(reservation.checkIn)
    const checkOutDate = new Date(reservation.checkOut)

    property.availability.forEach((day) => {
      const date = new Date(day.date)
      if (date >= checkInDate && date < checkOutDate) {
        day.available = true
      }
    })

    await property.save()

    // Invalidar el caché después de cancelar una reserva
    await redisClient.flushAll()

    reservation.status = 'cancelled by tenant'
    await reservation.save()

    // Publicar el evento de reserva cancelada en Redis
    await redisClient.publish(
      'reservationCancelled',
      JSON.stringify(reservation),
    )

    res.status(200).json({ message: 'Reservation cancelled', refundPercentage })
  } catch (error: any) {
    console.error('Error cancelling reservation:', error)
    res
      .status(500)
      .json({ error: 'Error cancelling reservation', details: error.message })
  }
}

export const viewReservation = async (req: Request, res: Response) => {
  const { email } = req.query
  const { reservationId } = req.params

  try {
    const reservationIdStr = String(reservationId)

    const reservation = await Reservation.findByPk(reservationIdStr)

    if (!reservation || reservation.email !== email) {
      return res
        .status(404)
        .json({ error: 'Reservation not found or email does not match' })
    }

    res.status(200).json(reservation)
  } catch (error: any) {
    console.error('Error viewing reservation:', error)
    res
      .status(500)
      .json({ error: 'Error viewing reservation', details: error.message })
  }
}

export const viewAllReservations = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, ...filters } = req.query

  try {
    const query = applyReservationFilters(filters)

    const reservations = await Reservation.findAll({
      ...query,
      offset: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
    })

    const total = await Reservation.count({ where: query.where })
    const totalPages = Math.ceil(total / Number(limit))

    res
      .status(200)
      .json({ reservations, page: Number(page), totalPages, total })
  } catch (error: any) {
    console.error('Error viewing all reservations:', error)
    res
      .status(500)
      .json({ error: 'Error viewing all reservations', details: error.message })
  }
}

export const makePayment = async (req: Request, res: Response) => {
  const { reservationId } = req.params

  try {
    const reservation = await Reservation.findByPk(reservationId)

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' })
    }

    await sendPayment(reservation.id)

    reservation.status = 'confirmed'
    await reservation.save()

    await redisClient.publish('paymentMade', JSON.stringify(reservation))

    res.status(200).json({ message: 'Payment received' })
  } catch (error: any) {
    console.error('Error making payment:', error)
    res
      .status(500)
      .json({ error: 'Error making payment', details: error.message })
  }
}
