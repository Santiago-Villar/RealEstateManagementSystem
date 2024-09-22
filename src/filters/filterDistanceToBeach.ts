import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterDistanceToBeach = (
  query: FilterQuery<typeof Property>,
  distanceToBeach?: number,
) => {
  if (distanceToBeach !== undefined) {
    query.distanceToBeach = distanceToBeach
  }
  return query
}
