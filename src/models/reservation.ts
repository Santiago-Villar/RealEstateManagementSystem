import { DataTypes, Model } from 'sequelize'
import sequelize from '../db/sequelize'

class Reservation extends Model {
  declare id: number
  declare propertyId: string
  declare document: string
  declare documentType: string
  declare firstName: string
  declare lastName: string
  declare email: string
  declare phone: string
  declare checkIn: Date
  declare checkOut: Date
  declare adults: number
  declare children: number
  declare status: string
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
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
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    adults: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    children: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'cancelled',
        'cancelled by tenant',
      ),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Reservation',
  },
)

export default Reservation
