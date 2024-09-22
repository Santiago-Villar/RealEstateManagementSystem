import { Router } from 'express'
import {
  createProperty,
  addAvailability,
  removeAvailability,
  searchProperties,
} from '../controllers/propertyController'
import { asyncHandler } from '../handlers/async-handler'
import { authMiddleware } from '../middleware/auth'

import { uploadImages } from '../utils/upload'
import { processUpload } from '../middleware/processUpload'

const router = Router()

router.post(
  '/',
  authMiddleware,
  uploadImages,
  asyncHandler(processUpload), // Este sube las imágenes solo después de una validación exitosa
  asyncHandler(createProperty),
)

router.post(
  '/:propertyId/availability',
  authMiddleware,
  asyncHandler(addAvailability),
)

router.post(
  '/:propertyId/unavailability',
  authMiddleware,
  asyncHandler(removeAvailability),
)

router.get('/search', asyncHandler(searchProperties))

export default router
