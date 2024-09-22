import { Queue, Worker } from 'bullmq'
import Reservation from '../models/reservation'
import Property from '../models/Property'
import FirestoreEmailService from './emailService'
import User from '../models/user'

async function handlePaymentResponse(job) {
  const { status, reservationId } = job.data
  const reservation = await Reservation.findByPk(reservationId)

  if (!reservation) {
    console.log('Reservation not found')
    return
  }

  const notificationService = new FirestoreEmailService()
  const property = await Property.findById(reservation.propertyId)

  if (status == 'accepted') {
    await reservation.update({ status: 'confirmed' })

    const admins = await User.findAll({ where: { role: 'Administrador' } })
    const notify = admins.map((admin) => admin.id).concat(property.owner)

    await Promise.all(
      notify.map((userId) =>
        notificationService.notify(
          userId,
          'Pago realizado',
          `El pago de la reserva ${reservationId} ha sido realizado`,
        ),
      ),
    )
    console.log('Accepted Payment Notification sent')
  } else {
    await reservation.update({ status: 'cancelled' })

    const removeStartDate = new Date(reservation.checkIn)
    const removeEndDate = new Date(reservation.checkOut)

    property.availability.forEach((day) => {
      if (day.date >= removeStartDate && day.date <= removeEndDate) {
        day.available = false
      }
    })

    await property.save()

    await notificationService.notify(
      property.owner,
      'Pago cancelado',
      `El pago de la reserva ${reservationId} fue cancelado por falta de pago`,
    )
    await notificationService.sendMail(
      reservation.email,
      'Pago cancelado',
      `El pago de la reserva ${reservationId} fue cancelado por falta de pago`,
    )
    console.log('Failed Payment Notification sent')
  }
}

const worker = new Worker('payments-response', handlePaymentResponse, {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
  },
})

worker.on('error', (error) => {
  console.error('Worker error:', error)
})

console.log('Worker is running...')
