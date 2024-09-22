import { Op } from 'sequelize'
import Reservation from '../models/reservation'

export const filterLastName = (query: any, lastName?: string): any => {
  if (lastName) {
    query.where = {
      ...query.where,
      lastName: {
        [Op.like]: `%${lastName}%`,
      },
    }
  }
  return query
}
