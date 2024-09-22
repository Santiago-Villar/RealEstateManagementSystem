import multer from 'multer'

const MAX_IMAGES = 4

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { files: MAX_IMAGES },
})

const uploadImages = upload.array('images', MAX_IMAGES)

export { uploadImages }
