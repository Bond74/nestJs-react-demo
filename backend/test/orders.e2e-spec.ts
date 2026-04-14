import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

describe('Orders (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: 'orders_queue',
        queueOptions: {
          durable: false,
        },
      },
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.startAllMicroservices();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('should create an order and eventually process it', async () => {
    const userId = new Types.ObjectId().toHexString();

    // 0. Create a product first
    const createProductRes = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Test Product',
        price: 100,
      })
      .expect(201);

    const productId = createProductRes.body._id;

    const createOrderDto = {
      userId,
      items: [
        {
          productId,
          quantity: 2,
        },
      ],
    };

    // 1. Create an order
    const createRes = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    const orderId = createRes.body._id;

    // 2. Ensure the order is created with status "pending"
    expect(createRes.body.status).toBe('pending');

    // 3. Check in loop during 5 sec that status changed to "processed"
    let status = 'pending';
    const startTime = Date.now();
    const timeout = 10000; // Increased timeout for slower environments

    while (status !== 'processed' && Date.now() - startTime < timeout) {
      const getRes = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .expect(200);
      status = getRes.body.status;
      if (status === 'processed') break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(status).toBe('processed');
  }, 20000);
});
