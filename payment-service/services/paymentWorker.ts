import { Queue, Worker } from 'bullmq'
import {processPayment} from './paymentService'
import { paymentResponseQueue } from '..'

async function handlePayment(job) {
  const paymentData = job.data

  const { reservationId } = paymentData
  const paymentStatus =  processPayment(reservationId)

  await paymentResponseQueue.add('payments-response', paymentStatus)
  console.log('payment processed:', `${paymentStatus.reservationId}: ${paymentStatus.status}`)
}

const worker = new Worker('payments', handlePayment, {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
  },
})

worker.on('error', (error) => {
  console.error('Worker error:', error)
})

console.log('Worker is running...')

