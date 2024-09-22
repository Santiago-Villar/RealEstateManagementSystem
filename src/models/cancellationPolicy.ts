import mongoose from 'mongoose'

const cancellationPolicySchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  daysBefore: { type: Number, required: true },
  refundPercentage: { type: Number, required: true },
})

const CancellationPolicy = mongoose.model(
  'CancellationPolicy',
  cancellationPolicySchema,
)

export default CancellationPolicy
