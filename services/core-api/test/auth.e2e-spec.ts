import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/users/schemas/user.schema';
import { BlacklistedToken } from '../src/auth/schemas/blacklisted-token.schema';
import * as bcrypt from 'bcrypt';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let blacklistModel: Model<BlacklistedToken>;

  // Dados de teste
  const testUser = {
    email: 'e2e-test@example.com',
    password: 'Test123!@#',
    name: 'E2E Test User',
    roles: ['user'],
  };

  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Adiciona pipes de validação (como em produção)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    blacklistModel = moduleFixture.get<Model<BlacklistedToken>>(
      getModelToken(BlacklistedToken.name),
    );

    // Limpa dados de teste anteriores
    await userModel.deleteMany({ email: testUser.email });
    await blacklistModel.deleteMany({});
  });

  afterAll(async () => {
    // Limpa dados de teste
    await userModel.deleteMany({ email: testUser.email });
    await blacklistModel.deleteMany({});
    await app.close();
  });

  describe('POST /users (Register)', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body).not.toHaveProperty('password'); // Senha não deve ser retornada
    });

    it('should fail when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409); // Conflict
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: 'another@example.com',
          password: '123', // Senha muito curta
        })
        .expect(400);
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Faltando password e name
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      // Salva token para testes subsequentes
      authToken = response.body.access_token;
    });

    it('should fail with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);
    });

    it('should fail with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          // Falta password
        })
        .expect(400);
    });
  });

  describe('GET /users/search (Profile)', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ email: testUser.email })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without authorization header', async () => {
      await request(app.getHttpServer())
        .get('/users/search')
        .query({ email: testUser.email })
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/search')
        .query({ email: testUser.email })
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });

    it('should fail with expired token format', async () => {
      await request(app.getHttpServer())
        .get('/users/search')
        .query({ email: testUser.email })
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        )
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('Logout realizado');
    });

    it('should fail to use blacklisted token', async () => {
      // Tenta usar o token que acabou de ser invalidado
      await request(app.getHttpServer())
        .get('/users/search')
        .query({ email: testUser.email })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });

    it('should fail logout without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('Integration: Complete Auth Flow', () => {
    it('should complete full auth cycle: register → login → access → logout', async () => {
      const newUser = {
        email: 'flow-test@example.com',
        password: 'FlowTest123!',
        name: 'Flow Test User',
        roles: ['user'],
      };

      // 1. Register
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      expect(registerRes.body.email).toBe(newUser.email);

      // 2. Login
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      const token = loginRes.body.access_token;
      expect(token).toBeDefined();

      // 3. Access Protected Route
      const profileRes = await request(app.getHttpServer())
        .get('/users/search')
        .query({ email: newUser.email })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileRes.body.email).toBe(newUser.email);

      // 4. Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // 5. Verify token is blacklisted
      await request(app.getHttpServer())
        .get('/users/search')
        .query({ email: newUser.email })
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      // Cleanup
      await userModel.deleteOne({ email: newUser.email });
    });
  });

  describe('Security Tests', () => {
    it('should hash passwords in database', async () => {
      const user = await userModel.findOne({ email: testUser.email });
      expect(user).toBeDefined();
      expect(user?.password).not.toBe(testUser.password);
      expect(user?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should not allow SQL injection in email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "admin@example.com' OR '1'='1",
          password: 'anything',
        });

      // Should fail with either 400 (invalid email) or 401 (unauthorized)
      expect([400, 401]).toContain(response.status);
    });

    it('should reject extra fields in registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'extra-fields@example.com',
          password: 'Test123!',
          name: 'Test',
          roles: ['user'],
          isAdmin: true, // Campo extra malicioso
          balance: 9999999,
        })
        .expect(400); // forbidNonWhitelisted should block this
    });
  });
});
