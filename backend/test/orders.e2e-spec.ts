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
    // 0. Create a user first
    const userEmail = `test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Test User',
        email: userEmail,
      })
      .expect(201);

    // 1. Authenticate to get token
    const authRes = await request(app.getHttpServer())
      .post('/users/auth')
      .send({ email: userEmail })
      .expect(201);

    const token = authRes.body.access_token;
    const userId = authRes.body.user.id;

    // 2. Create a product
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

    // 3. Create an order
    const createRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(createOrderDto)
      .expect(201);

    const orderId = createRes.body._id;

    // 4. Ensure the order is created with status "pending"
    expect(createRes.body.status).toBe('pending');

    // 5. Check in loop during 10 sec that status changed to "processed"
    let status = 'pending';
    const startTime = Date.now();
    const timeout = 10000;

    while (status !== 'processed' && Date.now() - startTime < timeout) {
      const getRes = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      status = getRes.body.status;
      if (status === 'processed') break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(status).toBe('processed');
  }, 30000);
});
