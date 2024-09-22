import { INotifyService } from '../interfaces/INotifyService'
import { firebaseAdmin } from '../config/firebase/firebase-admin'
import User from '../models/user'

class FirestoreEmailService implements INotifyService {
  private db

  constructor() {
    this.db = firebaseAdmin.firestore()
  }

  async notify(userId: string, title: string, text: string): Promise<void> {
    const user = await User.findByPk(userId)
    await this.sendMail(user.email, title, text)
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    await this.db.collection('mail').add({
      to,
      message: {
        subject,
        text,
      },
    })
  }
}

export default FirestoreEmailService
