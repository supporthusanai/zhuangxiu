import mongoose, { Document, Schema } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentType = 'consultation' | 'site_visit' | 'design_review' | 'construction_check';

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  merchant: mongoose.Types.ObjectId;
  designer?: mongoose.Types.ObjectId;
  type: AppointmentType;
  appointmentNo: string;
  date: Date;
  timeSlot: string;
  status: AppointmentStatus;
  contactName: string;
  contactPhone: string;
  address?: string;
  projectArea?: number;
  projectStyle?: string;
  note?: string;
  cancelReason?: string;
  merchantNote?: string;
  reminder: {
    sent: boolean;
    sentAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    designer: {
      type: Schema.Types.ObjectId,
      ref: 'Designer',
    },
    type: {
      type: String,
      enum: ['consultation', 'site_visit', 'design_review', 'construction_check'],
      required: true,
    },
    appointmentNo: {
      type: String,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    address: String,
    projectArea: Number,
    projectStyle: String,
    note: String,
    cancelReason: String,
    merchantNote: String,
    reminder: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 生成预约编号
appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentNo) {
    const date = new Date();
    const prefix = 'YY';
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.appointmentNo = `${prefix}${dateStr}${random}`;
  }
  next();
});

// 索引
appointmentSchema.index({ user: 1, status: 1 });
appointmentSchema.index({ merchant: 1, date: 1, status: 1 });
appointmentSchema.index({ designer: 1, date: 1 });
appointmentSchema.index({ appointmentNo: 1 });
appointmentSchema.index({ date: 1 });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
