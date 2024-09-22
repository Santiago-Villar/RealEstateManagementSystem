import { Router, Request, Response } from 'express'

import { AuthService } from '../services/auth'
import { asyncHandler } from '../handlers/async-handler'

const router = Router()
const authService = AuthService.getInstance()

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await authService.signInWithEmailAndPassword(email, password)

    res.json({ user })
  }),
)

router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await authService.createUserWithEmailAndPassword(
      email,
      password,
    )

    res.json({ user })
  }),
)

export default router
