import { Router } from 'express'
import {
  createCancellationPolicy,
  updateCancellationPolicy,
} from '../controllers/cancellationPolicyController'
import { authMiddleware } from '../middleware/auth'
import { authorizationMiddleware, roles } from '../middleware/authorize'

const router = Router()

router.post(
  '/',
  authMiddleware,
  authorizationMiddleware(roles.ADMIN),
  createCancellationPolicy,
)

router.put(
  '/:country',
  authMiddleware,
  authorizationMiddleware(roles.ADMIN),
  updateCancellationPolicy,
)

export default router
