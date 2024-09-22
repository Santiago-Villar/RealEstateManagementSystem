import admin from 'firebase-admin'
import { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      uid?: string
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token)

    req.uid = decodedToken.uid
    next()
  } catch (error: any) {
    res.status(401).json({ error: 'Unauthorized', details: error.message })
  }
}
