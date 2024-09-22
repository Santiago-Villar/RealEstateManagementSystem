import { PaymentResponse } from "../models/paymentResponse"

export const processPayment = (reservationId: string) => {
  if (shouldRejectPayment()) {
    return {
      status: 'rejected',
      reservationId: reservationId
    } as PaymentResponse
  }

  return {
    status: 'accepted',
    reservationId: reservationId
  } as PaymentResponse
}

const shouldRejectPayment = () => Math.random() < 0.25