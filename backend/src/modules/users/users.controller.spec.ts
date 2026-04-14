import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('3600'),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create', async () => {
      const dto = { name: 'test user', email: 'test@example.com' };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('auth', () => {
    it('should return a JWT if user exists and is active', async () => {
      const email = 'test@example.com';
      const user = { _id: 'user-id', email, name: 'Test User', isActive: true };
      (service.findByEmail as jest.Mock).mockResolvedValue(user);

      const result = await controller.auth(email);

      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const email = 'nonexistent@example.com';
      (service.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(controller.auth(email)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const email = 'inactive@example.com';
      const user = { _id: 'user-id', email, isActive: false };
      (service.findByEmail as jest.Mock).mockResolvedValue(user);

      await expect(controller.auth(email)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
