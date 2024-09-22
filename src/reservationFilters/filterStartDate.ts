import { Op } from 'sequelize'
import Reservation from '../models/reservation'

export const filterStartDate = (query: any, startDate?: string): any => {
  if (startDate) {
    query.where = {
      ...query.where,
      checkIn: {
        [Op.gte]: startDate,
      },
    }
  }
  return query
}
