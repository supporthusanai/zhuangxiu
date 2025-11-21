import mongoose, { Schema, Document } from 'mongoose';

// 订单状态枚举
export type OrderStatus =
  | 'pending'      // 待确认
  | 'confirmed'    // 已确认
  | 'designing'    // 设计中
  | 'constructing' // 施工中
  | 'completed'    // 已完成
  | 'cancelled';   // 已取消

// 支付状态枚举
export type PaymentStatus =
  | 'unpaid'       // 未支付
  | 'partial'      // 部分支付
  | 'paid';        // 已支付

// 订单项接口
export interface IOrderItem {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

// 支付记录接口
export interface IPaymentRecord {
  amount: number;
  method: 'wechat' | 'alipay' | 'bank' | 'cash';
  transactionId?: string;
  paidAt: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNo: string;              // 订单号
  user: mongoose.Types.ObjectId;      // 用户
  merchant: mongoose.Types.ObjectId;  // 商家
  designer?: mongoose.Types.ObjectId; // 设计师
  case?: mongoose.Types.ObjectId;     // 关联案例

  // 项目信息
  projectName: string;          // 项目名称
  projectAddress: string;       // 项目地址
  projectArea: number;          // 面积（平方米）
  projectStyle: string;         // 装修风格
  projectRooms: string;         // 户型

  // 价格信息
  items: IOrderItem[];          // 订单项
  totalAmount: number;          // 总金额
  discount: number;             // 折扣
  finalAmount: number;          // 最终金额
  paidAmount: number;           // 已支付金额

  // 状态
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payments: IPaymentRecord[];   // 支付记录

  // 时间节点
  expectedStartDate?: Date;     // 预计开工日期
  expectedEndDate?: Date;       // 预计完工日期
  actualStartDate?: Date;       // 实际开工日期
  actualEndDate?: Date;         // 实际完工日期

  // 备注
  customerNote?: string;        // 客户备注
  merchantNote?: string;        // 商家备注

  // 联系信息
  contactName: string;          // 联系人
  contactPhone: string;         // 联系电话

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const PaymentRecordSchema = new Schema<IPaymentRecord>({
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ['wechat', 'alipay', 'bank', 'cash'],
    required: true,
  },
  transactionId: String,
  paidAt: { type: Date, default: Date.now },
  note: String,
}, { _id: true });

const OrderSchema = new Schema<IOrder>(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
    },
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
    case: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
    },
    projectName: {
      type: String,
      required: [true, '项目名称不能为空'],
      trim: true,
    },
    projectAddress: {
      type: String,
      required: [true, '项目地址不能为空'],
    },
    projectArea: {
      type: Number,
      required: [true, '项目面积不能为空'],
      min: 0,
    },
    projectStyle: {
      type: String,
      required: [true, '装修风格不能为空'],
    },
    projectRooms: {
      type: String,
      required: [true, '户型不能为空'],
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'designing', 'constructing', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    payments: [PaymentRecordSchema],
    expectedStartDate: Date,
    expectedEndDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    customerNote: String,
    merchantNote: String,
    contactName: {
      type: String,
      required: [true, '联系人不能为空'],
    },
    contactPhone: {
      type: String,
      required: [true, '联系电话不能为空'],
    },
  },
  {
    timestamps: true,
  }
);

// 索引
OrderSchema.index({ orderNo: 1 });
OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ merchant: 1, status: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// 生成订单号
OrderSchema.pre('validate', async function (next) {
  if (!this.orderNo) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNo = `ZX${dateStr}${random}`;
  }
  next();
});

// 计算支付状态
OrderSchema.pre('save', function (next) {
  if (this.paidAmount >= this.finalAmount) {
    this.paymentStatus = 'paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'unpaid';
  }
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);
