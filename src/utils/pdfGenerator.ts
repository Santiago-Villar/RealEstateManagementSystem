import PDFDocument from 'pdfkit'
import { bucket } from '../config/firebase/firebase-admin'

export const generateIncomeReportPDF = async (
  reportData: any,
  fileName: string,
): Promise<string> => {
  const doc = new PDFDocument()
  const file = bucket.file(fileName)
  const stream = file.createWriteStream({
    resumable: false,
    contentType: 'application/pdf',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  })

  doc.pipe(stream)

  doc.fontSize(20).text('Income Report', { align: 'center' })

  doc.moveDown()
  doc
    .fontSize(12)
    .text(`Total Income: ${reportData.totalIncome}`, { align: 'left' })

  doc.moveDown()
  doc.fontSize(16).text('Reservations:', { align: 'left' })
  reportData.reservations.forEach((reservation: any) => {
    doc.moveDown()
    doc.fontSize(12).text(`Reservation ID: ${reservation.id}`)
    doc.text(`Inquilino: ${reservation.firstName} ${reservation.lastName}`)
    doc.text(`Documento: ${reservation.document} (${reservation.documentType})`)
    doc.text(`Email: ${reservation.email}`)
    doc.text(`Phone: ${reservation.phone}`)
    doc.text(`Check-In: ${new Date(reservation.checkIn).toLocaleDateString()}`)
    doc.text(
      `Check-Out: ${new Date(reservation.checkOut).toLocaleDateString()}`,
    )
    doc.text(`Amount: ${reservation.amount}`)
    doc.moveDown()
  })

  doc.end()

  return new Promise((resolve, reject) => {
    stream.on('finish', async () => {
      try {
        const publicUrl = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500',
        })
        resolve(publicUrl[0])
      } catch (error) {
        reject(error)
      }
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}

export const generateOccupancyReportPDF = async (
  reportData: any,
  fileName: string,
): Promise<string> => {
  const doc = new PDFDocument()
  const file = bucket.file(fileName)
  const stream = file.createWriteStream({
    resumable: false,
    contentType: 'application/pdf',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  })

  doc.pipe(stream)

  doc.fontSize(20).text('Occupancy Report', { align: 'center' })

  doc.moveDown()
  doc
    .fontSize(12)
    .text(`Report generated on: ${new Date().toLocaleDateString()}`, {
      align: 'left',
    })

  doc.moveDown()
  doc.fontSize(16).text('Occupancy by Neighborhood:', { align: 'left' })

  const tableTop = 150
  const columnLeft = 50
  const columnGap = 150
  const rowHeight = 20

  doc.fontSize(12)

  // Cabecera de la tabla
  doc.text('Barrio', columnLeft, tableTop)
  doc.text('Cant de Inmuebles del barrio', columnLeft + columnGap, tableTop)
  doc.text('Cant de Inmuebles Alquilados', columnLeft + columnGap * 2, tableTop)
  doc.text('%', columnLeft + columnGap * 3, tableTop)

  // Datos de la tabla
  let yPos = tableTop + rowHeight
  reportData.forEach((data: any) => {
    doc.text(data.neighborhood, columnLeft, yPos)
    doc.text(data.totalProperties, columnLeft + columnGap, yPos)
    doc.text(data.rentedProperties, columnLeft + columnGap * 2, yPos)
    doc.text(
      (data.occupancyRate * 100).toFixed(2) + '%',
      columnLeft + columnGap * 3,
      yPos,
    )
    yPos += rowHeight
  })

  doc.end()

  return new Promise((resolve, reject) => {
    stream.on('finish', async () => {
      try {
        const publicUrl = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500',
        })
        resolve(publicUrl[0])
      } catch (error) {
        reject(error)
      }
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}
