import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { OrdersService } from '../orders/orders.service';
import { Logger } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: OrdersService,
          useValue: {
            updateStatus: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processOrder', () => {
    it('should process order and update status', async () => {
      const data = { orderId: 'test-order-id' };
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.processOrder(data);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Processing order: ${data.orderId}`,
      );
      expect(ordersService.updateStatus).toHaveBeenCalledWith(
        data.orderId,
        'processed',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Order ${data.orderId} processed successfully`,
      );
    });
  });
});
