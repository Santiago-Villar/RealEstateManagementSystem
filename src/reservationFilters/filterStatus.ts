import { Op } from 'sequelize'
import Reservation from '../models/reservation'

export const filterStatus = (query: any, status?: string): any => {
  if (status) {
    query.where = {
      ...query.where,
      status,
    }
  }
  return query
}
