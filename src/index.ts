import express from 'express'
import * as dotenv from 'dotenv'
import connectDB from './config/database/database'
import { logMiddleware } from './middleware/log'
import { authMiddleware } from './middleware/auth'
import { authorizationMiddleware, roles } from './middleware/authorize'
import { errorHandler } from './handlers/error-handler'
import { asyncHandler } from './handlers/async-handler'
import authRouter from './routes/auth'
import sensorRouter from './routes/sensor'
import cancellationRouter from './routes/cancellationPolicyRoutes'
import propertyRouter from './routes/propertyRoutes'
import sequelize from './db/sequelize'
import reservationRouter from './routes/reservationRoutes'
import seed from './db/sequelize/seed'
import { initialize as initializeRedis } from './config/redis/redisClient'
import Property from './models/Property'
import './services/paymentWorker'
import './services/sensors/signalWorker'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Debugging output
console.log('REDIS_HOST:', process.env.REDIS_HOST)
console.log('REDIS_PORT:', process.env.REDIS_PORT)

connectDB()

app.use(express.json())
app.use(logMiddleware)
app.use('/auth', authRouter)
app.use('/properties', propertyRouter)
app.use('/reservations', reservationRouter)
app.use('/sensors', sensorRouter)
app.use('/cancellation-policies', cancellationRouter)

app.get(
  '/',
  asyncHandler(async (req, res) => {
    res.send('Hello World!')
  }),
)

app.get(
  '/admin',
  [authMiddleware, authorizationMiddleware(roles.ADMIN)],
  asyncHandler(async (req, res) => {
    res.send(`Hello user ${req.uid}!`)
  }),
)

// Insertar un documento de prueba directamente en MongoDB
app.get(
  '/test-mongo',
  asyncHandler(async (req, res) => {
    res.send(`Hello user ${req.uid}!`)
  }),
)

app.use(errorHandler)

const start = async (): Promise<void> => {
  try {
    // Inicializar Redis
    await initializeRedis()

    // Ejecutar el script de seed antes de iniciar el servidor
    await sequelize.sync() // Sincroniza la base de datos
    await seed() // Ejecuta el script de seed

    //require('../subscriber/eventSubscriber');

    app.listen(port, () => {
      console.log(`Server started on port ${port}`)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()
