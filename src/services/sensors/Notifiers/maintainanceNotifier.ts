import FirestoreEmailService from '../../emailService'
import { Notifier, getNotifyTo } from './Notifier'

export class MaintainanceNotifier implements Notifier {
  async call(sensor, signal, property) {
    const notifyTo = getNotifyTo(property)

    const emailService = new FirestoreEmailService()
    notifyTo.forEach((userId) => {
      emailService.notify(
        userId,
        'Maintainance Alert',
        `Sensor ${sensor.sensorId} has triggered a maintainance alert at ${new Date()}: ${property.name}: ${signal}`,
      )
    })
  }
}
