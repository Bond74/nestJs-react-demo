import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop([
    {
      productId: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ])
  items: { productId: string; quantity: number }[];

  @Prop({ default: 'pending', enum: ['pending', 'processed'] })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
