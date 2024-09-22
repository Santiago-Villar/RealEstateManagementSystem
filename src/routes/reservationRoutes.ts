import { Router } from 'express'
import {
  createReservation,
  cancelReservation,
  viewReservation,
  makePayment,
  viewAllReservations,
} from '../controllers/reservationController'
import { asyncHandler } from '../handlers/async-handler'
import { authMiddleware } from '../middleware/auth'
import { authorizationMiddleware, roles } from '../middleware/authorize'

const router = Router()

router.post(
  '/',
  authMiddleware,
  authorizationMiddleware(roles.INQUILINO),
  asyncHandler(createReservation),
)

router.post(
  '/:reservationId/cancel',
  authMiddleware,
  authorizationMiddleware(roles.INQUILINO),
  asyncHandler(cancelReservation),
)

router.get(
  '/:reservationId',
  authMiddleware,
  authorizationMiddleware(roles.INQUILINO),
  asyncHandler(viewReservation),
)

router.post(
  '/:reservationId/pay',
  authMiddleware,
  authorizationMiddleware(roles.INQUILINO),
  asyncHandler(makePayment),
)

router.get(
  '/',
  authMiddleware,
  authorizationMiddleware([roles.ADMIN, roles.OPERARIO]),
  asyncHandler(viewAllReservations),
)

export default router
