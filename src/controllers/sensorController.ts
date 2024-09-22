import { Request, Response } from 'express'
import { Queue } from 'bullmq'

import Sensor from '../models/sensor'
import {
  getSensorSignal,
  handleObservablePropery,
  handleSignal,
} from '../services/sensors/sensorService'
import { readFile } from '../services/fileWriter'

interface ObservableProperty {
  path: string
  name: string
  unitOfMeasure: string
  alertRegex: string
  minValue: number
  maxValue: number
  priority: number
  notify: [string]
}

export const createSensor = async (req: Request, res: Response) => {
  try {
    const sensorData = req.body
    const newSensor = new Sensor(sensorData)
    const sensor = await newSensor.save()

    const sensorProps = sensorData['observableProperties']
    sensorProps.forEach((property: ObservableProperty, index: number) => {
      handleObservablePropery(sensor, property, index)
    })
    await sensor.save()

    res.status(201).json(sensor)
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message })
    } else {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const assignSensorToProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { propertyId } = req.body

    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' })
    }

    const sensor = await Sensor.findOne({ sensorId: id })
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' })
    }

    sensor.propertyId = propertyId
    await sensor.save()

    res.json({ message: 'Sensor assigned to property successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const signalQueue = new Queue('signals', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
})

export const receiveSignal = async (req: Request, res: Response) => {
  try {
    const rawPriorities = readFile('sensors/priorities.json')
    const priorities = JSON.parse(rawPriorities)

    const priority = findPriority(req.body, priorities)

    await signalQueue.add('signal', req.body, { priority: priority })
    res.status(200).json({ message: 'Signal received and queued.' })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

const findPriority = (body, priorities) => {
  Object.keys(priorities).forEach((key) => {
    if (body[key]) {
      return priorities[key]
    }
  })
  return 1
}

export const sensorState = async (req: Request, res: Response) => {
  try {
    const { id, propName } = req.params
    const sensor = await Sensor.findOne({ sensorId: id })

    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' })
    }

    const hasProp = sensor.observableProperties.some(
      (prop) => prop.name === propName,
    )
    if (!hasProp) {
      return res.status(404).json({ message: 'Property not found' })
    }

    const signal = await getSensorSignal(id, propName)
    if (!signal) {
      return res.status(404).json({ message: 'Signal not found' })
    }

    res.json({ signal: signal })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
