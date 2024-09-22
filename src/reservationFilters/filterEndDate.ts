import { Op } from 'sequelize'
import Reservation from '../models/reservation'

export const filterEndDate = (query: any, endDate?: string): any => {
  if (endDate) {
    query.where = {
      ...query.where,
      checkOut: {
        [Op.lte]: endDate,
      },
    }
  }
  return query
}
