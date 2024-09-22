import express from 'express'
import { Queue } from 'bullmq'
import 'dotenv/config'

import { initializeRedis } from './config/redis'
import './services/paymentWorker'


const app = express()
const port = process.env.PORT || 8080

app.use(express.json())

app.get('/health', (req, res) => {
    res.send(`OK`)
})

const paymentQueue = new Queue('payments', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
  },
})

export const paymentResponseQueue = new Queue('payments-response', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
  },
})

app.post('/api/payment', async (req, res) => {
  await paymentQueue.add('payments', req.body)

  res.status(200).json({ message: 'Payment received and queued.' })
})

const start = async (): Promise<void> => {
  try {
    await initializeRedis()

    app.listen(port, () => {
      console.log(`Server started on port ${port}`)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()

