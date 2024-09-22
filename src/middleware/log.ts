import { Request, Response, NextFunction } from 'express'
import Log from '../models/log'

export const logMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { method, hostname, path, uid } = req // Extract uid if available
  const time = new Date(Date.now()).toString()

  res.on('finish', async () => {
    const status = res.statusCode
    const message = res.statusMessage

    const logEntry = new Log({
      method,
      hostname,
      path,
      time,
      status,
      message,
      user: uid || 'unauthenticated', // Add user information to the log entry
    })

    try {
      await logEntry.save()
      console.log('Log saved to MongoDB')
    } catch (error) {
      console.error('Error saving log to MongoDB:', error)
    }
  })

  next()
}
