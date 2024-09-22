import { Request, Response } from 'express'
import CancellationPolicy from '../models/cancellationPolicy'

export const createCancellationPolicy = async (req: Request, res: Response) => {
  const { country, daysBefore, refundPercentage } = req.body

  try {
    const newPolicy = new CancellationPolicy({
      country,
      daysBefore,
      refundPercentage,
    })
    await newPolicy.save()
    res.status(201).json(newPolicy)
  } catch (error: any) {
    console.error('Error creating cancellation policy:', error)
    res.status(500).json({
      error: 'Error creating cancellation policy',
      details: error.message,
    })
  }
}

export const updateCancellationPolicy = async (req: Request, res: Response) => {
  const { country } = req.params
  const { daysBefore, refundPercentage } = req.body

  try {
    const policy = await CancellationPolicy.findOneAndUpdate(
      { country },
      { daysBefore, refundPercentage },
      { new: true },
    )
    if (!policy) {
      return res.status(404).json({ error: 'Cancellation policy not found' })
    }
    res.status(200).json(policy)
  } catch (error: any) {
    console.error('Error updating cancellation policy:', error)
    res.status(500).json({
      error: 'Error updating cancellation policy',
      details: error.message,
    })
  }
}
