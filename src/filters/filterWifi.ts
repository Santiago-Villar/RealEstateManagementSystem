// src/filters/filterWifi.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterWifi = (
  query: FilterQuery<typeof Property>,
  wifi?: string,
): FilterQuery<typeof Property> => {
  if (wifi) {
    query.wifi = wifi === 'true'
  }
  return query
}
