import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth,
  UserCredential,
} from 'firebase/auth'
import { firebaseAdmin } from '../config/firebase/firebase-admin'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'

import firebaseApp from '../config/firebase/firebase-app'

export class AuthService {
  private static instance: AuthService
  private auth: Auth

  private constructor() {
    this.auth = getAuth(firebaseApp)
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  createUserWithEmailAndPassword = (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(this.auth, email, password)
  }

  signInWithEmailAndPassword = (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    return signInWithEmailAndPassword(this.auth, email, password)
  }

  verifyToken = (token: string): Promise<DecodedIdToken> => {
    return firebaseAdmin.auth().verifyIdToken(token)
  }
}
