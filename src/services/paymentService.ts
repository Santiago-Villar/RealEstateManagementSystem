import axios from 'axios'

export const sendPayment = (reservationId) => {
  console.log('Sending payment for reservation:', reservationId)
  return axios.post(process.env.PAYMENT_SERVICE_URL, {
    reservationId: reservationId,
  })
}
