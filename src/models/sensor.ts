import mongoose from 'mongoose'

const sensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    maxlength: 15,
  },
  description: {
    type: String,
    maxlength: 200,
  },
  serialNumber: {
    type: String,
    maxlength: 45,
  },
  brand: {
    type: String,
    maxlength: 50,
  },
  serviceAddress: {
    type: String,
    maxlength: 1000,
  },
  lastCheckDate: {
    type: Date,
  },
  serviceType: {
    type: String,
  },
  observableProperties: [
    {
      name: {
        type: String,
        maxlength: 50,
      },
      path: {
        type: String,
        maxlength: 1000,
      },
    },
  ],
  propertyId: {
    type: String,
  },
})

export default mongoose.model('Sensor', sensorSchema)
