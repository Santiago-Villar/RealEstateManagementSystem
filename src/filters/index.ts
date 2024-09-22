import { FilterQuery } from 'mongoose'
import Property from '../models/Property'
import { filterAdults } from './filterAdults'
import { filterChildren } from './filterChildren'
import { filterDoubleBeds } from './filterDoubleBeds'
import { filterSingleBeds } from './filterSingleBeds'
import { filterAirConditioning } from './filterAirConditioning'
import { filterWifi } from './filterWifi'
import { filterGarage } from './filterGarage'
import { filterType } from './filterType'
import { filterDistanceToBeach } from './filterDistanceToBeach'
import { filterState } from './filterState'
import { filterResort } from './filterResort'
import { filterNeighborhood } from './filterNeighborhood'

export const applyFilters = (filters: any): FilterQuery<typeof Property> => {
  let query: FilterQuery<typeof Property> = {}
  query = filterAdults(query, filters.adults)
  query = filterChildren(query, filters.children)
  query = filterDoubleBeds(query, filters.doubleBeds)
  query = filterSingleBeds(query, filters.singleBeds)
  query = filterAirConditioning(query, filters.airConditioning)
  query = filterWifi(query, filters.wifi)
  query = filterGarage(query, filters.garage)
  query = filterType(query, filters.type)
  query = filterDistanceToBeach(query, filters.distanceToBeach)
  query = filterState(query, filters.state)
  query = filterResort(query, filters.resort)
  query = filterNeighborhood(query, filters.neighborhood)
  return query
}
