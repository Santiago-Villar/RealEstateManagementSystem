// src/filters/filterAdults.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterAdults = (
  query: FilterQuery<typeof Property>,
  adults?: number,
) => {
  if (adults !== undefined) {
    query.adults = adults
  }
  return query
}
