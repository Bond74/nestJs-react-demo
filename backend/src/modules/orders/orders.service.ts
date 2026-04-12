import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject('ORDER_SERVICE') private client: ClientProxy,
  ) {}

  async create(createOrderDto: any): Promise<Order> {
    const newOrder = new this.orderModel(createOrderDto);
    const savedOrder = await newOrder.save();

    // Publish to RabbitMQ
    this.client.emit('order_created', { orderId: savedOrder._id });

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  // MongoDB Aggregation with $lookup
  async findOneEnriched(id: string): Promise<any> {
    const results = await this.orderModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $unwind: '$items',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          items: {
            $push: {
              productId: '$items.productId',
              quantity: '$items.quantity',
              product: '$productDetails',
            },
          },
        },
      },
    ]);

    if (!results || results.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return results[0];
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    return this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }
}
