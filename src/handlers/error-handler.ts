import { Request, Response, NextFunction } from 'express'

import { AppError } from '../errors/base-error'
import { FirebaseError } from 'firebase/app'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const notifyError = (statusCode: number, message: string) => {
    res.status(statusCode).json({ message })
  }

  if (err instanceof AppError) {
    notifyError(err.statusCode, err.message)
    return
  }

  if (err instanceof FirebaseError) {
    notifyError(401, 'Wrong email or password')
    return
  }

  notifyError(500, 'An unexpected error occurred')
}
