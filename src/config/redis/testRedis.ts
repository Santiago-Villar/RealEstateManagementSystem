import { createClient } from 'redis'

const testRedisConnection = async () => {
  const redisHost = process.env.REDIS_HOST || 'redis'
  const redisPort = process.env.REDIS_PORT || '6379'

  const redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`,
  })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  console.log('Redis client connected')
  await redisClient.disconnect()
}

testRedisConnection().catch((err) => {
  console.error('Failed to connect to Redis:', err)
})
