import { Task } from './Task'

export class CheckRange implements Task {
  run(sensor, signal, property, validation) {
    if (
      validation.minValue === undefined ||
      validation.maxValue === undefined
    ) {
      return
    }

    if (signal < validation.minValue || signal > validation.maxValue) {
      throw new Error(`Signal ${signal} discarded for beign out of bounds.`)
    }
  }
}
