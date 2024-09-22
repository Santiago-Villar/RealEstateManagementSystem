import { NextFunction, Request, Response } from 'express'
import Role from '../models/role'

export const roles = {
  ADMIN: 'Administrador',
  PROPIETARIO: 'Propietario',
  INQUILINO: 'Inquilino',
  OPERARIO: 'Operario',
}

export const authorizationMiddleware = (expectedRoles: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.uid

    if (!userId) {
      return res.status(401).send({ message: 'Authentication required' })
    }

    const userRoles: Role[] = await Role.findAll({ where: { userId: userId } })
    const userRolesTypes = userRoles.map((role) => role?.name)

    if (Array.isArray(expectedRoles)) {
      if (expectedRoles.some((role) => userRolesTypes.includes(role))) {
        return next()
      }
    } else {
      if (userRolesTypes.includes(expectedRoles)) {
        return next()
      }
    }

    res.status(403).send({ message: 'Forbidden: Insufficient permissions' })
  }
}
