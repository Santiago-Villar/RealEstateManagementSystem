import { readFile } from '../../fileWriter'
import { MaintainanceNotifier } from './maintainanceNotifier'
import { SecurityNotifier } from './securityNotifier'

export interface Notifier {
  call(sensor, signal, property)
}

export const getNotifyTo = (property) => {
  const propertyFile = readFile(property.path)
  const propertyData = JSON.parse(propertyFile)

  return propertyData.notify
}

export const getNotifier = (type): Notifier => {
  if (type === 'maintainance') {
    return new MaintainanceNotifier()
  }
  if (type === 'security') {
    return new SecurityNotifier()
  }
  throw new Error('Notifier not found')
}
