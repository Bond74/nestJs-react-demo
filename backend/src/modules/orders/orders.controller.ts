import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user._id, createOrderDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req) {
    return this.ordersService.findAll(req.user._id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.ordersService.findOneEnriched(id, req.user._id);
  }
}
