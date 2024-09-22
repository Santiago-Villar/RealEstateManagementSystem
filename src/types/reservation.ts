import { Document, Types } from 'mongoose'

export interface IReservation extends Document {
  id: number // Usamos un valor numérico para el ID de la reserva
  property: Types.ObjectId // Usamos string aquí porque almacenaremos el ObjectId como una cadena
  document: string
  documentType: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'Administrador' | 'Operario' | 'Propietario' | 'Inquilino'
  checkIn: Date
  checkOut: Date
  adults: number
  children: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
