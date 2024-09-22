import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterResort = (
  query: FilterQuery<typeof Property>,
  resort?: string,
) => {
  if (resort !== undefined) {
    query.resort = resort
  }
  return query
}
