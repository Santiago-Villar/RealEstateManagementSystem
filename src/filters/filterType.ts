// src/filters/filterType.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterType = (
  query: FilterQuery<typeof Property>,
  type?: string,
): FilterQuery<typeof Property> => {
  if (type) {
    query.type = type
  }
  return query
}
