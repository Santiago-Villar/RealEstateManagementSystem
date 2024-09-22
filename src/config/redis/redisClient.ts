import { createClient } from 'redis'

let redisClient: any
let subscriber: any

export const initialize = async () => {
  const redisHost = process.env.REDIS_HOST || 'localhost' // 'redis' es el nombre del servicio en Docker Compose
  const redisPort = process.env.REDIS_PORT || '6379'

  redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`,
  })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  subscriber = redisClient.duplicate()
  await subscriber.connect()
}

export const getRedisClient = () => redisClient
export const getSubscriber = () => subscriber

initialize()
  .then(() => {
    console.log('Redis client connected')
  })
  .catch((err) => {
    console.error('Failed to connect to Redis:', err)
  })
