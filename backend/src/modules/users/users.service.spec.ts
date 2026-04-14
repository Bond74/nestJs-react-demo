import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;

  const mockUser = {
    name: 'test user',
    email: 'test@example.com',
    save: jest.fn().mockResolvedValue({
      _id: 'test-id',
      name: 'test user',
      email: 'test@example.com',
    }),
  };

  const mockUserModel = jest.fn().mockImplementation(() => mockUser);
  (mockUserModel as any).findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({}),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const dto = { name: 'test user', email: 'test@example.com' };
      const result = await service.create(dto);

      expect(model).toHaveBeenCalledWith(dto);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ _id: 'test-id' }));
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const id = 'test-id';
      await service.findById(id);
      expect(model.findById).toHaveBeenCalledWith(id);
    });
  });
});
