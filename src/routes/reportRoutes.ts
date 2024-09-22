import { Router } from 'express'
import {
  getIncomeReport,
  getOccupancyReport,
} from '../controllers/reportController'
import { asyncHandler } from '../handlers/async-handler'
import { authMiddleware } from '../middleware/auth'
import { authorizationMiddleware, roles } from '../middleware/authorize'

const router = Router()

router.get(
  '/income',
  authMiddleware,
  authorizationMiddleware([roles.ADMIN, roles.OPERARIO]),
  asyncHandler(getIncomeReport),
)

router.get(
  '/occupancy-rate',
  authMiddleware,
  authorizationMiddleware([roles.ADMIN, roles.OPERARIO]),
  asyncHandler(getOccupancyReport),
)

export default router
