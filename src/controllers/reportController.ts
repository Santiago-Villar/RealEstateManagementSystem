import { Request, Response } from 'express'
import Reservation from '../models/reservation'
import Property from '../models/Property'
import {
  generateIncomeReportPDF,
  generateOccupancyReportPDF,
} from '../utils/pdfGenerator'
import FirestoreEmailService from '../services/emailService'

const emailService = new FirestoreEmailService()

const getPropertyById = async (propertyId: string) => {
  return await Property.findById(propertyId)
}

export const getIncomeReport = async (req: Request, res: Response) => {
  const { propertyId, startDate, endDate, userId } = req.query

  if (!propertyId || !startDate || !endDate || !userId) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    const property = await getPropertyById(propertyId as string)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    const reservations = await Reservation.findAll({
      where: {
        propertyId,
        checkIn: { $gte: new Date(startDate as string) },
        checkOut: { $lte: new Date(endDate as string) },
        status: 'confirmed',
      },
    })

    const totalIncome = reservations.reduce((sum, reservation) => {
      const nights =
        (new Date(reservation.checkOut).getTime() -
          new Date(reservation.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
      return sum + nights * property.costPerNight
    }, 0)

    const reportData = { reservations, totalIncome }

    // Generar PDF y subir a Firebase Storage
    const fileName = `income_report_${propertyId}_${startDate}_${endDate}.pdf`
    const publicUrl = await generateIncomeReportPDF(reportData, fileName)

    // Enviar el correo con el enlace al PDF usando notify
    const subject = 'Your Income Report'
    const text = `Your income report is ready. You can download it from the following link: ${publicUrl}`
    await emailService.notify(userId as string, subject, text)

    res.status(200).json({
      message: 'Report generated and email sent successfully',
      publicUrl,
    })
  } catch (error: any) {
    console.error('Error fetching income report:', error)
    res
      .status(500)
      .json({ error: 'Error fetching income report', details: error.message })
  }
}

export const getOccupancyReport = async (req: Request, res: Response) => {
  const { startDate, endDate, userId } = req.query

  if (!startDate || !endDate || !userId) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    const properties = await Property.find()

    const occupancyData = await Promise.all(
      properties.map(async (property) => {
        const totalReservations = await Reservation.count({
          where: {
            propertyId: property._id.toString(),
            checkIn: { $gte: new Date(startDate as string) },
            checkOut: { $lte: new Date(endDate as string) },
            status: 'confirmed',
          },
        })

        return {
          neighborhood: property.neighborhood,
          totalProperties: properties.length,
          rentedProperties: totalReservations,
          occupancyRate: totalReservations / properties.length,
        }
      }),
    )

    // Agrupar por barrio y calcular el porcentaje de ocupación
    const groupedData: { [key: string]: any } = {}
    occupancyData.forEach((data) => {
      if (!groupedData[data.neighborhood]) {
        groupedData[data.neighborhood] = {
          totalProperties: 0,
          rentedProperties: 0,
        }
      }
      groupedData[data.neighborhood].totalProperties += data.totalProperties
      groupedData[data.neighborhood].rentedProperties += data.rentedProperties
    })

    const finalData = Object.keys(groupedData)
      .map((key) => ({
        neighborhood: key,
        totalProperties: groupedData[key].totalProperties,
        rentedProperties: groupedData[key].rentedProperties,
        occupancyRate:
          groupedData[key].rentedProperties / groupedData[key].totalProperties,
      }))
      .sort((a, b) => b.occupancyRate - a.occupancyRate)

    // Generar PDF y subir a Firebase Storage
    const fileName = `occupancy_report_${startDate}_${endDate}.pdf`
    const publicUrl = await generateOccupancyReportPDF(finalData, fileName)

    // Enviar el correo con el enlace al PDF usando notify
    const subject = 'Your Occupancy Report'
    const text = `Your occupancy report is ready. You can download it from the following link: ${publicUrl}`
    await emailService.notify(userId as string, subject, text)

    res.status(200).json({
      message: 'Report generated and email sent successfully',
      publicUrl,
    })
  } catch (error: any) {
    console.error('Error fetching occupancy report:', error)
    res.status(500).json({
      error: 'Error fetching occupancy report',
      details: error.message,
    })
  }
}
