// src/filters/filterState.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterState = (
  query: FilterQuery<typeof Property>,
  state?: string,
): FilterQuery<typeof Property> => {
  if (state) {
    query.state = state
  }
  return query
}
