import { getSubscriber, initialize } from '../config/redis/redisClient'
import FirestoreEmailService from '../services/emailService'
import Reservation from '../models/reservation'
import User from '../models/user'
import Property from '../models/Property'
import connectMongoDB from '../config/database/database' // Importar la conexión a MongoDB
import sequelize from '../db/sequelize' // Importar la conexión a la base de datos SQL

console.log('Event subscriber is starting...')
let subscriber: any
const emailService = new FirestoreEmailService()

initialize().then(async () => {
  await connectMongoDB()
  console.log('MongoDB connected for subscriber')

  try {
    await sequelize.authenticate()
    console.log('SQL database connected for subscriber')
  } catch (error) {
    console.error('Unable to connect to the SQL database:', error)
    process.exit(1)
  }

  subscriber = getSubscriber()

  console.log('Subscriber initialized and connected to Redis')

  subscriber.subscribe('reservationCreated', async (message: string) => {
    console.log('Received reservationCreated event')
    const reservation = JSON.parse(message)
    console.log(`Reservation created: ${reservation.id}`)

    try {
      console.log('Fetching admins...')
      const admins = await User.findAll({ where: { role: 'Administrador' } })
      console.log(`Admins fetched: ${admins.length}`)

      console.log('Fetching property...')
      console.log(`Property ID: ${reservation.propertyId}`)
      const property = await Property.findById(reservation.propertyId)
      if (!property) {
        throw new Error('Property not found')
      }
      console.log('Property fetched:', property)

      console.log('Fetching owner...')
      const owner = await User.findByPk(property.owner)
      console.log('Owner fetched:', owner)

      const adminSubject = 'Nueva reserva creada'
      const adminText = `Se ha creado una nueva reserva: ${reservation.id}`
      for (const admin of admins) {
        console.log(`Notifying admin: ${admin.email}`)
        await emailService.notify(admin.id, adminSubject, adminText)
      }

      if (owner) {
        const ownerSubject = 'Nueva reserva en tu propiedad'
        const ownerText = `Se ha creado una nueva reserva en tu propiedad: ${reservation.id}`
        console.log(`Notifying owner: ${owner.email}`)
        await emailService.notify(owner.id, ownerSubject, ownerText)
      }
    } catch (error) {
      console.error('Error notifying admins and owner:', error)
    }
  })

  subscriber.subscribe('paymentMade', async (message: string) => {
    console.log('Received paymentMade event')
    const reservation = JSON.parse(message)
    console.log(`Payment made for reservation: ${reservation.id}`)

    try {
      const admins = await User.findAll({ where: { role: 'Administrador' } })
      const property = await Property.findById(reservation.propertyId)
      if (!property) {
        throw new Error('Property not found')
      }
      const owner = await User.findByPk(property.owner)

      const adminSubject = 'Pago realizado para reserva'
      const adminText = `Se ha realizado un pago para la reserva: ${reservation.id}`
      for (const admin of admins) {
        console.log(`Notifying admin: ${admin.email}`)
        await emailService.notify(admin.id, adminSubject, adminText)
      }

      if (owner) {
        const ownerSubject = 'Pago realizado para una reserva en tu propiedad'
        const ownerText = `Se ha realizado un pago para una reserva en tu propiedad: ${reservation.id}`
        console.log(`Notifying owner: ${owner.email}`)
        await emailService.notify(owner.id, ownerSubject, ownerText)
      }
    } catch (error) {
      console.error('Error notifying admins and owner:', error)
    }
  })

  subscriber.subscribe('reservationCancelled', async (message: string) => {
    console.log('Received reservationCancelled event')
    const reservation = JSON.parse(message)
    console.log(`Reservation cancelled: ${reservation.id}`)

    try {
      const admins = await User.findAll({ where: { role: 'Administrador' } })
      const property = await Property.findById(reservation.propertyId)
      if (!property) {
        throw new Error('Property not found')
      }
      const owner = await User.findByPk(property.owner)

      const adminSubject = 'Reserva cancelada'
      const adminText = `Se ha cancelado una reserva: ${reservation.id}`
      for (const admin of admins) {
        console.log(`Notifying admin: ${admin.email}`)
        await emailService.notify(admin.id, adminSubject, adminText)
      }

      if (owner) {
        const ownerSubject = 'Reserva cancelada en tu propiedad'
        const ownerText = `Se ha cancelado una reserva en tu propiedad: ${reservation.id}`
        console.log(`Notifying owner: ${owner.email}`)
        await emailService.notify(owner.id, ownerSubject, ownerText)
      }
    } catch (error) {
      console.error('Error notifying admins and owner:', error)
    }
  })
})
