import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterNeighborhood = (
  query: FilterQuery<typeof Property>,
  neighborhood?: string,
) => {
  if (neighborhood !== undefined) {
    query.neighborhood = neighborhood
  }
  return query
}
