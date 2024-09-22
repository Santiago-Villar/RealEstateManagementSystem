// src/filters/filterGarage.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterGarage = (
  query: FilterQuery<typeof Property>,
  garage?: string,
): FilterQuery<typeof Property> => {
  if (garage) {
    query.garage = garage === 'true'
  }
  return query
}
