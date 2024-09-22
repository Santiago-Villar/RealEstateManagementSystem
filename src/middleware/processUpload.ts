import { bucket } from '../config/firebase/firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { Request, Response, NextFunction } from 'express'

const MAX_SIZE = 500 * 1024 // 500 KB

const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  const filename = `${uuidv4()}-${file.originalname}`
  const fileUpload = bucket.file(filename)

  // Redimensionar y comprimir la imagen usando sharp
  let buffer = await sharp(file.buffer)
    .resize(800, 800, { fit: 'inside' })
    .toFormat('jpeg', { quality: 80 })
    .toBuffer()

  // Verificar si la imagen aún supera el tamaño máximo permitido y ajustar la calidad si es necesario
  let quality = 80
  while (buffer.length > MAX_SIZE && quality > 10) {
    buffer = await sharp(buffer)
      .toFormat('jpeg', { quality: (quality -= 10) })
      .toBuffer()
  }

  if (buffer.length > MAX_SIZE) {
    throw new Error(
      'Image exceeds the maximum allowed size of 500 KB even after compression',
    )
  }

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  })

  return new Promise<string>((resolve, reject) => {
    stream.on('error', (error: Error) => {
      console.error('Error during file upload:', error)
      reject(error)
    })

    stream.on('finish', async () => {
      try {
        await fileUpload.makePublic()
        resolve(`https://storage.googleapis.com/${bucket.name}/${filename}`)
      } catch (error) {
        console.error('Error making file public:', error)
        reject(error)
      }
    })

    stream.end(buffer)
  })
}

const processUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body.images = []
  for (const file of req.files as Express.Multer.File[]) {
    try {
      const imageUrl = await uploadFile(file)
      req.body.images.push(imageUrl)
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: 'Error uploading to Firebase Storage',
          details: error.message,
        })
      }
      return res
        .status(500)
        .json({ error: 'Unknown error occurred during file upload' })
    }
  }
  next()
}

export { processUpload }
