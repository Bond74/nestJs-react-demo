import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../../modules/users/users.service';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let usersService: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no auth header', async () => {
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue({
      headers: {},
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new UnauthorizedException('No token provided'),
    );
  });

  it('should throw UnauthorizedException if invalid token format', async () => {
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue({
      headers: { authorization: 'InvalidToken' },
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new UnauthorizedException('No token provided'),
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue({
      headers: { authorization: 'Bearer valid.token.here' },
    });
    (jwt.decode as jest.Mock).mockReturnValue({ sub: 'user-id' });
    mockUsersService.findById.mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new UnauthorizedException('User not found'),
    );
  });

  it('should throw UnauthorizedException if user is inactive', async () => {
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue({
      headers: { authorization: 'Bearer valid.token.here' },
    });
    (jwt.decode as jest.Mock).mockReturnValue({ sub: 'user-id' });
    mockUsersService.findById.mockResolvedValue({
      _id: 'user-id',
      isActive: false,
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      new UnauthorizedException('User is not active'),
    );
  });

  it('should return true and attach user to request if user is active', async () => {
    const request = {
      headers: { authorization: 'Bearer valid.token.here' },
      user: null,
    };
    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(request);
    (jwt.decode as jest.Mock).mockReturnValue({ sub: 'user-id' });
    const user = { _id: 'user-id', isActive: true };
    mockUsersService.findById.mockResolvedValue(user);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(request.user).toEqual(user);
  });
});
