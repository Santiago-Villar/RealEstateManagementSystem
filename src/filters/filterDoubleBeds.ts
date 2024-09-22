import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterDoubleBeds = (
  query: FilterQuery<typeof Property>,
  doubleBeds?: number,
) => {
  if (doubleBeds !== undefined) {
    query.doubleBeds = doubleBeds
  }
  return query
}
