import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() createUserDto: { name: string; email: string }) {
    return this.usersService.create(createUserDto);
  }

  @Post('auth')
  async auth(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const sessionDuration = this.configService.get<string>(
      'SESSION_DURATION',
      '3600',
    );
    const expiresIn = parseInt(sessionDuration, 10);

    const payload = {
      sub: user._id,
      email: user.email,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const token = jwt.sign(payload, jwtSecret, { expiresIn });

    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
