import { AppError } from './base-error'

export class ValidationError extends AppError {
  constructor(message = 'Invalid data') {
    super(message, 400)
  }
}
