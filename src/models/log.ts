import mongoose, { Schema, Document } from 'mongoose'

export interface ILog extends Document {
  method: string
  hostname: string
  path: string
  time: string
  status: number
  message: string
}

const LogSchema: Schema = new Schema({
  method: { type: String, required: true },
  hostname: { type: String, required: true },
  path: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: Number, required: true },
  message: { type: String, required: true },
})

export default mongoose.model<ILog>('Log', LogSchema)
