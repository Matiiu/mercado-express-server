import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppModule (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should bootstrap the application', () => {
    expect(app).toBeDefined();
  });

  it('/alerts (GET) should match snapshot', async () => {
    const response = await request(app.getHttpServer()).get('/alerts');

    expect(response.status).toBe(200);
    expect(response.body).toMatchSnapshot();
  });

  it('/prodcuts (GET) should match snapshot', async () => {
    const response = await request(app.getHttpServer()).get('/products');

    expect(response.status).toBe(200);
    expect(response.body).toMatchSnapshot();
  });

  afterEach(async () => {
    await app.close();
  });
});
