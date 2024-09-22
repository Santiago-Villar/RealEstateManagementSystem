import { getNotifier } from '../Notifiers/Notifier'
import { Task } from './Task'

export class CheckAlert implements Task {
  run(sensor, signal, property, validation) {
    const regex = new RegExp(validation.alertRegex)
    if (regex.test(signal)) {
      const notifier = getNotifier(sensor.serviceType)
      notifier.call(sensor, signal, property).then(() => {
        console.log('Alert sent')
      })
    }
  }
}
