import { createClient } from 'redis'

let redisClient: any

export const initializeRedis = async () => {
  const redisHost = process.env.REDIS_HOST || 'localhost'
  const redisPort = process.env.REDIS_PORT || '6379'

  redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`,
  })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
}

export const getRedisClient = () => redisClient