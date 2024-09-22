import { Router } from 'express'

import { asyncHandler } from '../handlers/async-handler'
import { authMiddleware } from '../middleware/auth'
import { authorizationMiddleware, roles } from '../middleware/authorize'
import {
  assignSensorToProperty,
  createSensor,
  receiveSignal,
  sensorState,
} from '../controllers/sensorController'

const router = Router()

router.post(
  '/',
  authMiddleware,
  authorizationMiddleware(roles.ADMIN),
  asyncHandler(createSensor),
)

router.post(
  '/:id/assign',
  authMiddleware,
  authorizationMiddleware(roles.ADMIN),
  asyncHandler(assignSensorToProperty),
)

router.post('/signal', asyncHandler(receiveSignal))

router.get('/:id/:propName', asyncHandler(sensorState))
export default router
