import { AppError } from './base-error'

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Wrong email or password') {
    super(message, 401)
  }
}
