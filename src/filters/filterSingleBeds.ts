// src/filters/filterSingleBeds.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterSingleBeds = (
  query: FilterQuery<typeof Property>,
  singleBeds?: string,
): FilterQuery<typeof Property> => {
  if (singleBeds) {
    query.singleBeds = { $gte: Number(singleBeds) }
  }
  return query
}
