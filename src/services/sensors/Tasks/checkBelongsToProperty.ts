import { Task } from './Task'

export class CheckBelongsToProperty implements Task {
  run(sensor, signal, property, validation) {
    if (!sensor.propertyId) {
      throw new Error(
        `Sensor ${sensor.sensorId} does not belong to a property. Signal ${signal} discarded.`,
      )
    }
  }
}
