import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from './order.schema';
import { Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let model: any;
  let client: any;

  const mockOrder = {
    _id: new Types.ObjectId().toHexString(),
    userId: '507f1f77bcf86cd799439011',
    items: [],
    status: 'pending',
    save: jest.fn().mockResolvedValue({
      _id: 'saved-id',
      userId: '507f1f77bcf86cd799439011',
      items: [],
      status: 'pending',
    }),
  };

  const mockOrderModel = jest.fn().mockImplementation(() => mockOrder);
  (mockOrderModel as any).find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    }),
  });
  (mockOrderModel as any).aggregate = jest.fn().mockResolvedValue([]);
  (mockOrderModel as any).findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({}),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: 'ORDER_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    model = module.get(getModelToken(Order.name));
    client = module.get('ORDER_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an order, then emit event', async () => {
      const dto: CreateOrderDto = {
        userId: '507f1f77bcf86cd799439011',
        items: [{ productId: '507f1f77bcf86cd799439012', quantity: 1 }],
      };
      const result = await service.create(dto);

      expect(model).toHaveBeenCalledWith(dto);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('order_created', {
        orderId: 'saved-id',
      });
      expect(result).toEqual(expect.objectContaining({ _id: 'saved-id' }));
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      await service.findAll();
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const id = 'test-id';
      const status = 'processed';
      await service.updateStatus(id, status);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { status },
        { new: true },
      );
    });
  });
});
