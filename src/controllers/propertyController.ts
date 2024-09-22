import { Request, Response } from 'express'
import Property from '../models/Property'
import { check, validationResult } from 'express-validator'
import { applyFilters } from '../filters'
import { createClient } from 'redis'
import { getRedisClient } from '../config/redis/redisClient'

const redisClient = getRedisClient()

redisClient.on('error', (err) => {
  console.error('Redis error:', err)
})

redisClient.on('connect', () => {
  console.log('Connected to Redis')
})

const initializeCalendar = () => {
  const today = new Date()
  const year = today.getFullYear()
  const daysInYear =
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365
  const calendar = []

  for (let i = 0; i < daysInYear; i++) {
    const date = new Date(year, 0, 1 + i)
    calendar.push({ date, available: false })
  }

  return calendar
}

export const createProperty = async (req: Request, res: Response) => {
  await check('name').notEmpty().withMessage('Name is required').run(req)
  await check('adults')
    .isInt({ min: 1, max: 20 })
    .withMessage('Adults must be between 1 and 20')
    .run(req)
  await check('children')
    .isInt({ min: 0, max: 20 })
    .withMessage('Children must be between 0 and 20')
    .run(req)
  await check('doubleBeds')
    .isInt({ min: 0, max: 10 })
    .withMessage('Double beds must be between 0 and 10')
    .run(req)
  await check('singleBeds')
    .isInt({ min: 0, max: 20 })
    .withMessage('Single beds must be between 0 and 20')
    .run(req)
  await check('distanceToBeach')
    .isInt({ min: 50, max: 20000 })
    .withMessage('Distance to beach must be between 50 and 20000 meters')
    .run(req)
  await check('costPerNight')
    .isInt({ min: 1 })
    .withMessage('Cost per night is required and must be a positive number')
    .run(req)
  await check('country').notEmpty().withMessage('Country is required').run(req)

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  if (!req.body.images || req.body.images.length < 4) {
    return res.status(400).json({
      errors: [
        {
          msg: 'At least 4 images are required',
          path: 'images',
          location: 'body',
        },
      ],
    })
  }

  if (Array.isArray(req.body.children)) {
    req.body.children = parseInt(req.body.children[0], 10)
  } else if (typeof req.body.children === 'string') {
    req.body.children = parseInt(req.body.children, 10)
  }

  if (typeof req.body.costPerNight === 'string') {
    req.body.costPerNight = parseInt(req.body.costPerNight, 10)
  }

  const {
    name,
    adults,
    children,
    doubleBeds,
    singleBeds,
    airConditioning,
    wifi,
    garage,
    type,
    distanceToBeach,
    state,
    resort,
    neighborhood,
    costPerNight,
    country,
  } = req.body
  const owner = req.uid

  // Log para depurar
  console.log('Request body after conversion:', req.body)

  try {
    const newProperty = new Property({
      name,
      adults,
      children,
      doubleBeds,
      singleBeds,
      airConditioning,
      wifi,
      garage,
      type,
      distanceToBeach,
      state,
      resort,
      neighborhood,
      images: req.body.images,
      owner,
      costPerNight,
      country,
      availability: initializeCalendar(), // Inicialmente vacío, se actualizará más tarde
    })

    await newProperty.save()
    res.status(201).json(newProperty)

    // Invalidar el caché después de crear una nueva propiedad
    await redisClient.flushAll()
  } catch (error: any) {
    console.error('Error creating property:', error)
    res
      .status(500)
      .json({ error: 'Error creating property', details: error.message })
  }
}

export const addAvailability = async (req: Request, res: Response) => {
  const { propertyId } = req.params
  const { startDate, endDate } = req.body

  try {
    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    if (property.owner !== req.uid) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const newStartDate = new Date(startDate)
    const newEndDate = new Date(endDate)

    for (const slot of property.availability) {
      if (slot.date >= newStartDate && slot.date <= newEndDate) {
        slot.available = true
      }
    }

    await property.save()

    // Invalidar el caché después de agregar disponibilidad
    await redisClient.flushAll()

    res.status(200).json(property)
  } catch (error: any) {
    console.error('Error adding availability:', error)
    res
      .status(500)
      .json({ error: 'Error adding availability', details: error.message })
  }
}

export const removeAvailability = async (req: Request, res: Response) => {
  const { propertyId } = req.params
  const { startDate, endDate } = req.body

  try {
    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    if (property.owner !== req.uid) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const removeStartDate = new Date(startDate)
    const removeEndDate = new Date(endDate)

    property.availability.forEach((day) => {
      if (day.date >= removeStartDate && day.date <= removeEndDate) {
        day.available = false
      }
    })

    await property.save()

    // Invalidar el caché después de eliminar disponibilidad
    await redisClient.flushAll()

    res.status(200).json(property)
  } catch (error: any) {
    console.error('Error removing availability:', error)
    res
      .status(500)
      .json({ error: 'Error removing availability', details: error.message })
  }
}

export const searchProperties = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, startDate, endDate, ...filters } = req.query

  // Validaciones
  await check('adults').optional().isInt({ min: 0, max: 99 }).run(req)
  await check('children').optional().isInt({ min: 0, max: 99 }).run(req)
  await check('doubleBeds').optional().isInt({ min: 0, max: 99 }).run(req)
  await check('singleBeds').optional().isInt({ min: 0, max: 99 }).run(req)
  await check('distanceToBeach')
    .optional()
    .isInt({ min: 0, max: 20000 })
    .run(req)

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const query = applyFilters(filters)
    const cacheKey = JSON.stringify({
      page,
      limit,
      startDate,
      endDate,
      filters,
    })

    const cachedData = await redisClient.get(cacheKey)
    if (cachedData) {
      // Si hay datos en caché, devolverlos
      return res.status(200).json(JSON.parse(cachedData))
    }

    let properties
    if (startDate && endDate) {
      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      query.availability = {
        $elemMatch: {
          date: { $gte: start, $lte: end },
          available: true,
        },
      }

      properties = await Property.find(query)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))

      // Filtrar solo las fechas dentro del rango especificado
      properties = properties.map((property) => {
        property.availability = property.availability.filter((day) => {
          const date = new Date(day.date)
          return date >= start && date <= end
        })
        return property
      })
    } else {
      properties = await Property.find(query)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))

      // Filtrar la disponibilidad para mostrar solo los próximos 30 días
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + 30)

      properties = properties.map((property) => {
        property.availability = property.availability.filter((day) => {
          const date = new Date(day.date)
          return date >= today && date <= futureDate
        })
        return property
      })
    }

    const total = await Property.countDocuments(query)
    const totalPages = Math.ceil(total / Number(limit))

    const response = {
      properties,
      page: Number(page),
      totalPages,
      total: properties.length,
    }

    // Guardar en caché
    await redisClient.set(cacheKey, JSON.stringify(response), {
      EX: 3600, // Expiración en segundos (1 hora)
    })

    res.status(200).json(response)
  } catch (error: any) {
    console.error('Error searching properties:', error)
    res
      .status(500)
      .json({ error: 'Error searching properties', details: error.message })
  }
}
