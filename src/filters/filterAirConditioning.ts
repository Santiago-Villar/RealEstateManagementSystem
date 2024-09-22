// src/filters/filterAirConditioning.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterAirConditioning = (
  query: FilterQuery<typeof Property>,
  airConditioning?: boolean,
) => {
  if (airConditioning !== undefined) {
    query.airConditioning = airConditioning
  }
  return query
}
