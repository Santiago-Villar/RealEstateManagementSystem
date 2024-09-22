import { Op } from 'sequelize'
import Reservation from '../models/reservation'
import { filterStartDate } from './filterStartDate'
import { filterEndDate } from './filterEndDate'
import { filterEmail } from './filterEmail'
import { filterFirstName } from './filterFirstName'
import { filterLastName } from './filterLastName'
import { filterStatus } from './filterStatus'

export const applyReservationFilters = (filters: any): any => {
  let query: any = { where: {} }
  query = filterStartDate(query, filters.startDate)
  query = filterEndDate(query, filters.endDate)
  query = filterEmail(query, filters.email)
  query = filterFirstName(query, filters.firstName)
  query = filterLastName(query, filters.lastName)
  query = filterStatus(query, filters.status)
  return query
}
