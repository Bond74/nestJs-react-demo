import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly ordersService: OrdersService) {}

  async processOrder(data: { orderId: string }) {
    this.logger.log(`Processing order: ${data.orderId}`);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update order status
    await this.ordersService.updateStatus(data.orderId, 'processed');

    this.logger.log(`Order ${data.orderId} processed successfully`);
  }
}
