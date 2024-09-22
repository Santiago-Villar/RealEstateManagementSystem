import sequelize from '../db/sequelize'

import { DataTypes, Model } from 'sequelize'

class Role extends Model {
  declare name: string
  declare userId: string
}

Role.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Role',
  },
)

export default Role
