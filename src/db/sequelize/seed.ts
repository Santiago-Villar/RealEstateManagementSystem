import 'dotenv/config' // Asegúrate de cargar las variables de entorno al principio
import { firebaseAdmin } from '../../config/firebase/firebase-admin'
import Role from '../../models/role'
import User from '../../models/user'
import sequelize from '../../db/sequelize'

const seed = async () => {
  console.log('Seeding roles and users...')

  try {
    // Conectar a la base de datos
    await sequelize.authenticate()
    console.log('Database connected')

    // Crear roles si no existen
    const rolesData = [
      { name: 'Propietario', userId: 'VhOcRno2B4fpJcbGJwcV4bVsmwo2' },
      { name: 'Inquilino', userId: 'RegXW2dMvqYPzvx5xO6B4RCb8Ds1' },
      { name: 'Operario', userId: 'RQWpLZicbXVuMtIJ7Z97PMlUyUk1' },
      { name: 'Administrador', userId: '6cvQQaOtUIOu5aIB38A8qCSbK8L2' },
      { name: 'Administrador', userId: 'HwJVFIssqHPAXKVHynJ3RzRgrYH3' },
      { name: 'Propietario', userId: 'Un6ghHd4Mhb1mKIes8bZDSNVJX83' },
    ]

    for (const roleData of rolesData) {
      const existingRole = await Role.findOne({
        where: { name: roleData.name, userId: roleData.userId },
      })
      if (!existingRole) {
        await Role.create(roleData)
      }
    }
    console.log('Roles seeded or verified.')

    // Obtener usuarios de Firebase
    const listUsersResult = await firebaseAdmin.auth().listUsers()
    console.log('Fetched users from Firebase')

    const usersData = [
      {
        uid: 'HwJVFIssqHPAXKVHynJ3RzRgrYH3',
        document: '53426465',
        documentType: 'DNI',
        firstName: 'MatiAdmin',
        lastName: 'Olivera',
        email: 'matiasoliverapimienta@hotmail.com',
        phone: '+226549866',
        role: 'Administrador',
      },
      {
        uid: 'Un6ghHd4Mhb1mKIes8bZDSNVJX83',
        document: '534534345',
        documentType: 'DNI',
        firstName: 'MatiPropietario',
        lastName: 'Olivera',
        email: 'matioliverapimienta@gmail.com',
        phone: '+8749518884',
        role: 'Propietario',
      },
      {
        uid: 'VhOcRno2B4fpJcbGJwcV4bVsmwo2',
        document: '12345678',
        documentType: 'DNI',
        firstName: 'John',
        lastName: 'Doe',
        email: 'propietario@gmail.com',
        phone: '+21234567890',
        role: 'Propietario',
      },
      {
        uid: 'RegXW2dMvqYPzvx5xO6B4RCb8Ds1',
        document: '87654321',
        documentType: 'DNI',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'inquilino@gmail.com',
        phone: '+7876354321',
        role: 'Inquilino',
      },
      {
        uid: 'RQWpLZicbXVuMtIJ7Z97PMlUyUk1',
        document: '54234126',
        documentType: 'DNI',
        firstName: 'Jose',
        lastName: 'Luis',
        email: 'operario_de_inmuebles@gmail.com',
        phone: '+7581235432',
        role: 'Operario',
      },
      {
        uid: '6cvQQaOtUIOu5aIB38A8qCSbK8L2',
        document: '32451235',
        documentType: 'DNI',
        firstName: 'Jose',
        lastName: 'Luis',
        email: 'administrador@gmail.com',
        phone: '+5587546325',
        role: 'Administrador',
      },
    ]

    // Insertar usuarios en la base de datos
    for (const userData of usersData) {
      const firebaseUser = listUsersResult.users.find(
        (user) => user.uid === userData.uid,
      )
      if (firebaseUser) {
        const existingUser = await User.findOne({
          where: { id: firebaseUser.uid },
        })
        if (!existingUser) {
          await User.create({
            id: firebaseUser.uid,
            document: userData.document,
            documentType: userData.documentType,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: firebaseUser.email,
            phone: userData.phone,
            role: userData.role,
          })
          console.log(`Created user ${firebaseUser.email}`)
        } else {
          console.log(`User ${firebaseUser.email} already exists, skipping.`)
        }
      } else {
        console.error(`Firebase user with UID ${userData.uid} not found`)
      }
    }

    console.log('Users seeded or verified.')
  } catch (error) {
    console.error('Error during seeding:', error)
  }
}

const checkUsers = async () => {
  try {
    const users = await User.findAll()
    console.log('Users in database:', JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

export default seed
export { checkUsers }
