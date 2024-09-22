// src/filters/filterChildren.ts

import { FilterQuery } from 'mongoose'
import Property from '../models/Property'

export const filterChildren = (
  query: FilterQuery<typeof Property>,
  children?: number,
) => {
  if (children !== undefined) {
    query.children = children
  }
  return query
}
