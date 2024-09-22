import { Op } from 'sequelize'
import Reservation from '../models/reservation'

export const filterEmail = (query: any, email?: string): any => {
  if (email) {
    query.where = {
      ...query.where,
      email: {
        [Op.like]: `%${email}%`,
      },
    }
  }
  return query
}
