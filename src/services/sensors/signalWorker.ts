import { Queue, Worker } from 'bullmq'

import Sensor from '../../models/sensor'
import { handleSignal } from './sensorService'

async function processSignal(job) {
  const signalData = job.data
  console.log('Processing signal:', signalData)

  const { sensorId } = signalData
  const sensor = await Sensor.findOne({ sensorId: sensorId })
  if (!sensor) {
    console.log('Sensor not found')
    return
  }

  sensor.observableProperties.forEach((property) => {
    const signal = signalData[property.name]

    try {
      handleSignal(sensor, signal, property)
    } catch (error) {
      console.log(error)
      return
    }
  })

  console.log('Signal processed:', signalData)
}

const worker = new Worker('signals', processSignal, {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
})

worker.on('error', (error) => {
  console.error('Worker error:', error)
})

console.log('Worker is running...')
