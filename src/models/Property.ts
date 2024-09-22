import mongoose from 'mongoose'

const dayAvailabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  available: { type: Boolean, required: true },
})

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  adults: { type: Number, required: true, min: 1, max: 20 },
  children: { type: Number, required: true, min: 0, max: 20 },
  doubleBeds: { type: Number, required: true, min: 0, max: 10 },
  singleBeds: { type: Number, required: true, min: 0, max: 20 },
  airConditioning: { type: Boolean, required: true },
  wifi: { type: Boolean, required: true },
  garage: { type: Boolean, required: true },
  type: { type: String, enum: ['house', 'apartment'], required: true },
  distanceToBeach: { type: Number, required: true, min: 50, max: 20000 },
  state: { type: String, required: true },
  resort: { type: String, required: true },
  neighborhood: { type: String, required: true },
  images: [{ type: String, required: true }],
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  availability: [dayAvailabilitySchema],
  owner: { type: String, required: true },
  costPerNight: { type: Number, required: true },
  country: { type: String, required: true },
})

// indices para hacer las busuqedas mas efectivas
propertySchema.index({ adults: 1 })
propertySchema.index({ children: 1 })
propertySchema.index({ doubleBeds: 1 })
propertySchema.index({ singleBeds: 1 })
propertySchema.index({ airConditioning: 1 })
propertySchema.index({ wifi: 1 })
propertySchema.index({ garage: 1 })
propertySchema.index({ type: 1 })
propertySchema.index({ distanceToBeach: 1 })
propertySchema.index({ state: 1 })
propertySchema.index({ resort: 1 })
propertySchema.index({ neighborhood: 1 })
//indices compuestos mas comunes
propertySchema.index({ adults: 1, children: 1 })
propertySchema.index({ state: 1, resort: 1, neighborhood: 1 })

export default mongoose.model('Property', propertySchema)
