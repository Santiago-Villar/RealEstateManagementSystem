import FirestoreEmailService from '../../emailService'
import { Notifier, getNotifyTo } from './Notifier'

export class SecurityNotifier implements Notifier {
  async call(sensor, signal, property) {
    const notifyTo = getNotifyTo(property)

    const emailService = new FirestoreEmailService()
    notifyTo.forEach((userId) => {
      emailService.notify(
        userId,
        'Security Alert',
        `Sensor ${sensor.sensorId} has detected a security breach at ${new Date()}, with a signal of ${signal}`,
      )
    })
  }
}
