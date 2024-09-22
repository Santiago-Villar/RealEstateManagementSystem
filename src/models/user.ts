import { DataTypes, Model } from 'sequelize'
import sequelize from '../db/sequelize'

class User extends Model {
  declare id: string
  declare document: string
  declare documentType: string
  declare firstName: string
  declare lastName: string
  declare email: string
  declare phone: string
  declare role: string
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        'Administrador',
        'Operario',
        'Propietario',
        'Inquilino',
      ),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
  },
)

export default User
