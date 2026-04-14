import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product } from './product.schema';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: any;

  const mockProduct = {
    name: 'test product',
    price: 100,
    save: jest.fn().mockResolvedValue({
      _id: 'test-id',
      name: 'test product',
      price: 100,
    }),
  };

  const mockProductModel = jest.fn().mockImplementation(() => mockProduct);
  (mockProductModel as any).find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  });
  (mockProductModel as any).findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({}),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get(getModelToken(Product.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const dto = { name: 'test product', price: 100 };
      const result = await service.create(dto);

      expect(model).toHaveBeenCalledWith(dto);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ _id: 'test-id' }));
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      await service.findAll();
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      const id = 'test-id';
      await service.findById(id);
      expect(model.findById).toHaveBeenCalledWith(id);
    });
  });
});
