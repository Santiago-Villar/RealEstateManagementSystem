export interface PaymentResponse {
  status: 'accepted' | 'rejected'
  reservationId: string
}