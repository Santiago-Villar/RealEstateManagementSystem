import { Op } from 'sequelize'
import Reservation from '../models/reservation'

export const filterFirstName = (query: any, firstName?: string): any => {
  if (firstName) {
    query.where = {
      ...query.where,
      firstName: {
        [Op.like]: `%${firstName}%`,
      },
    }
  }
  return query
}
