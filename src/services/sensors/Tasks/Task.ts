import { CheckBelongsToProperty } from './checkBelongsToProperty'
import { CheckRange } from './checkRange'
import { CheckAlert } from './checkAlert'

export interface Task {
  run(sensor, signal, property, validation)
}

export const getTasks = (): Task[] => {
  return [new CheckBelongsToProperty(), new CheckRange(), new CheckAlert()]
}
