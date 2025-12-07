import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/users/schemas/user.schema';
import { WeatherLog } from '../src/weather/schemas/weather.schema';

describe('Weather API (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let weatherModel: Model<WeatherLog>;
  let authToken: string;
  let internalToken: string;

  // Dados de teste
  const testUser = {
    email: 'weather-test@example.com',
    password: 'Test123!@#',
    name: 'Weather Test User',
    roles: ['user'],
  };

  const sampleWeatherData = {
    temperature: 25.5,
    humidity: 65,
    condition: 'Parcialmente nublado',
    weather_code: 2,
    location: 'São Paulo',
    collected_at: new Date().toISOString(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    weatherModel = moduleFixture.get<Model<WeatherLog>>(
      getModelToken(WeatherLog.name),
    );

    // Limpa dados de teste
    await userModel.deleteMany({ email: testUser.email });
    await weatherModel.deleteMany({ location: 'São Paulo' });

    // Cria usuário e obtém token
    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginRes.body.access_token;
    internalToken = process.env.INTERNAL_API_TOKEN || 'test-internal-token';
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: testUser.email });
    await weatherModel.deleteMany({ location: 'São Paulo' });
    await app.close();
  });

  describe('POST /weather (Internal)', () => {
    it('should create weather log with valid internal token', async () => {
      const response = await request(app.getHttpServer())
        .post('/weather')
        .set('x-internal-token', internalToken)
        .send(sampleWeatherData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.temperature).toBe(sampleWeatherData.temperature);
      expect(response.body.location).toBe(sampleWeatherData.location);
    });

    it('should fail without internal token', async () => {
      await request(app.getHttpServer())
        .post('/weather')
        .send(sampleWeatherData)
        .expect(401);
    });

    it('should fail with invalid internal token', async () => {
      await request(app.getHttpServer())
        .post('/weather')
        .set('x-internal-token', 'wrong-token')
        .send(sampleWeatherData)
        .expect(401);
    });

    it('should fail with invalid weather data', async () => {
      await request(app.getHttpServer())
        .post('/weather')
        .set('x-internal-token', internalToken)
        .send({
          temperature: 'invalid', // Deve ser número
          humidity: 65,
        })
        .expect(400);
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/weather')
        .set('x-internal-token', internalToken)
        .send({
          temperature: 25,
          // Falta outros campos obrigatórios
        })
        .expect(400);
    });

    it('should validate temperature range', async () => {
      await request(app.getHttpServer())
        .post('/weather')
        .set('x-internal-token', internalToken)
        .send({
          ...sampleWeatherData,
          temperature: -100, // Temperatura extrema
        })
        .expect(400);
    });

    it('should validate humidity range (0-100)', async () => {
      await request(app.getHttpServer())
        .post('/weather')
        .set('x-internal-token', internalToken)
        .send({
          ...sampleWeatherData,
          humidity: 150, // Umidade > 100%
        })
        .expect(400);
    });
  });

  describe('GET /weather (Paginated)', () => {
    beforeAll(async () => {
      // Insere dados de teste
      const weatherLogs = Array.from({ length: 25 }, (_, i) => ({
        ...sampleWeatherData,
        temperature: 20 + i,
        collected_at: new Date(Date.now() - i * 60000).toISOString(), // 1 min de diferença
      }));

      await weatherModel.insertMany(weatherLogs);
    });

    it('should return paginated weather logs with auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.data).toHaveLength(10);
      expect(response.body.page).toBe(1);
    });

    it('should return second page correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.data).toHaveLength(10);
    });

    it('should respect custom limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.limit).toBe(5);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/weather?page=1&limit=10')
        .expect(401);
    });

    it('should handle invalid pagination params', async () => {
      await request(app.getHttpServer())
        .get('/weather?page=invalid&limit=abc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should order by most recent first', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dates = response.body.data.map((log: any) =>
        new Date(log.collected_at).getTime(),
      );

      // Verifica se está ordenado descendente
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('GET /weather/recent/:hours', () => {
    it('should return weather logs from last 24 hours', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather/recent/24')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verifica se todos os logs são das últimas 24h
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      response.body.forEach((log: any) => {
        const logTime = new Date(log.collected_at).getTime();
        expect(logTime).toBeGreaterThan(cutoff);
      });
    });

    it('should return empty array for 0 hours', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather/recent/0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should fail with negative hours', async () => {
      await request(app.getHttpServer())
        .get('/weather/recent/-5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/weather/recent/24').expect(401);
    });
  });

  describe('GET /weather/export/csv', () => {
    it('should export weather data as CSV with auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather/export/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename=',
      );
      expect(response.text).toContain('Temperatura');
      expect(response.text).toContain('Umidade');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/weather/export/csv').expect(401);
    });
  });

  describe('GET /weather/export/xlsx', () => {
    it('should export weather data as XLSX with auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather/export/xlsx')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename=',
      );
      // SuperTest with StreamableFile returns data differently - just check it exists
      expect(response.body).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/weather/export/xlsx')
        .expect(401);
    });
  });

  describe('POST /weather/insights', () => {
    it('should generate AI insights for recent weather data', async () => {
      const response = await request(app.getHttpServer())
        .post('/weather/insights')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hours: 24 })
        .expect(200);

      expect(response.body).toHaveProperty('insights');
      expect(typeof response.body.insights).toBe('string');
      expect(response.body.insights.length).toBeGreaterThan(0);
    }, 30000); // 30s timeout para IA

    it('should handle no data gracefully', async () => {
      // Limpa todos os dados temporariamente
      await weatherModel.deleteMany({});

      const response = await request(app.getHttpServer())
        .post('/weather/insights')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hours: 1 })
        .expect(200);

      expect(response.body.insights).toContain('dados insuficientes');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/weather/insights')
        .send({ hours: 24 })
        .expect(401);
    });
  });

  describe('Integration: Complete Weather Flow', () => {
    it('should complete full weather cycle: ingest → query → export', async () => {
      // 1. Ingest data (via internal token)
      const newData = {
        temperature: 28.5,
        humidity: 70,
        condition: 'Ensolarado',
        weather_code: 0,
        location: 'São Paulo',
        collected_at: new Date().toISOString(),
      };

      await request(app.getHttpServer())
        .post('/weather')
        .set('x-internal-token', internalToken)
        .send(newData)
        .expect(201);

      // 2. Query data (via user auth)
      const queryRes = await request(app.getHttpServer())
        .get('/weather?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(queryRes.body.data[0].temperature).toBe(newData.temperature);

      // 3. Export data
      const exportRes = await request(app.getHttpServer())
        .get('/weather/export/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(exportRes.text).toContain(newData.temperature.toString());
    });
  });

  describe('GET /weather/insights', () => {
    it('should return full weather insights', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather/insights')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // May contain insights or indicate no data
      expect(response.body).toHaveProperty('summary');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/weather/insights').expect(401);
    });
  });

  describe('GET /weather/forecast-insights', () => {
    it('should return forecast insights from AI', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather/forecast-insights')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Response should have some structure (AI insights or no data message)
      expect(response.body).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/weather/forecast-insights')
        .expect(401);
    });
  });
});
