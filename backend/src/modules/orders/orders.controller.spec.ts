import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            findAll: jest.fn().mockResolvedValue([]),
            findOneEnriched: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call ordersService.create with userId from request', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dto: CreateOrderDto = {
        items: [{ productId: '507f1f77bcf86cd799439012', quantity: 2 }],
      };
      const req = { user: { _id: userId } };
      await controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('findAll', () => {
    it('should call ordersService.findAll with userId from request', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const req = { user: { _id: userId } };
      await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should call ordersService.findOneEnriched with id and userId', async () => {
      const id = 'test-id';
      const userId = '507f1f77bcf86cd799439011';
      const req = { user: { _id: userId } };
      await controller.findOne(req, id);
      expect(service.findOneEnriched).toHaveBeenCalledWith(id, userId);
    });
  });
});
