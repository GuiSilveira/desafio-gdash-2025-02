import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let adminToken: string;
  let userToken: string;
  let testUserId: string;

  // Dados de teste
  const adminUser = {
    email: 'admin-test@example.com',
    password: 'Admin123!@#',
    name: 'Admin Test User',
    roles: ['admin'],
  };

  const regularUser = {
    email: 'user-test@example.com',
    password: 'User123!@#',
    name: 'Regular Test User',
    roles: ['user'],
  };

  const newUser = {
    email: 'newuser@example.com',
    password: 'NewUser123!',
    name: 'New User',
    roles: ['user'],
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

    // Limpa dados de teste
    await userModel.deleteMany({
      email: {
        $in: [adminUser.email, regularUser.email, newUser.email],
      },
    });

    // Cria admin diretamente no banco (já que POST /users requer auth)
    const hashedAdminPassword = await bcrypt.hash(adminUser.password, 10);
    await userModel.create({
      ...adminUser,
      password: hashedAdminPassword,
    });

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminToken = adminLoginRes.body.access_token;

    // Cria usuário regular diretamente no banco
    const hashedUserPassword = await bcrypt.hash(regularUser.password, 10);
    const createdUser = await userModel.create({
      ...regularUser,
      password: hashedUserPassword,
    });

    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: regularUser.email,
        password: regularUser.password,
      });

    userToken = userLoginRes.body.access_token;
    testUserId = createdUser._id.toString();
  });

  afterAll(async () => {
    await userModel.deleteMany({
      email: {
        $in: [adminUser.email, regularUser.email, newUser.email],
      },
    });
    await app.close();
  });

  describe('GET /users', () => {
    it('should return all users for admin with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Response is paginated with {data, total, page, limit, totalPages}
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      // Verifica que senhas não são retornadas
      response.body.data.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should fail for regular users (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return specific user for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body._id).toBe(testUserId);
      expect(response.body.email).toBe(regularUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail for regular users accessing other users', async () => {
      // Pega ID do admin
      const adminData = await userModel.findOne({ email: adminUser.email });

      await request(app.getHttpServer())
        .get(`/users/${adminData?._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011') // ID válido mas inexistente
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('POST /users', () => {
    it('should create new user as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body.email).toBe(newUser.email);
      expect(response.body.name).toBe(newUser.name);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail for regular users', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'another@example.com',
          password: 'Test123!',
          name: 'Another User',
          roles: ['user'],
        })
        .expect(403);
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser) // Tenta criar novamente
        .expect(409);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...newUser,
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body._id).toBe(testUserId);
    });

    it('should update password and hash it', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: 'NewPassword123!',
        })
        .expect(200);

      // Verifica no banco que senha foi hasheada
      const user = await userModel.findById(testUserId);
      expect(user?.password).not.toBe('NewPassword123!');
      expect(user?.password).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should fail for regular users updating others', async () => {
      const adminData = await userModel.findOne({ email: adminUser.email });

      await request(app.getHttpServer())
        .patch(`/users/${adminData?._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Hacked Name',
        })
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .patch('/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test',
        })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user as admin', async () => {
      // Cria usuário temporário para deletar
      const tempUser = await userModel.create({
        email: 'temp-delete@example.com',
        password: 'Test123!',
        name: 'Temp User',
        roles: ['user'],
      });

      await request(app.getHttpServer())
        .delete(`/users/${tempUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verifica que foi deletado
      const deleted = await userModel.findById(tempUser._id);
      expect(deleted).toBeNull();
    });

    it('should fail for regular users', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce admin-only routes', async () => {
      const adminRoutes = [
        { method: 'get', path: '/users' },
        { method: 'post', path: '/users' },
        { method: 'delete', path: `/users/${testUserId}` },
      ];

      for (const route of adminRoutes) {
        const req = (request(app.getHttpServer()) as any)[route.method](
          route.path,
        );

        if (route.method === 'post') {
          req.send({
            email: 'test@example.com',
            password: 'Test123!',
            name: 'Test User',
          });
        }

        await req.set('Authorization', `Bearer ${userToken}`).expect(403);
      }
    });

    it('should allow admin to access all routes', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Response is paginated
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid role values', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-role@example.com',
          password: 'Test123!',
          name: 'Test',
          roles: ['superuser'], // Role inválida
        })
        .expect(400);
    });

    it('should reject empty name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'empty-name@example.com',
          password: 'Test123!',
          name: '', // Nome vazio
          roles: ['user'],
        })
        .expect(400);
    });

    it('should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'weak-password@example.com',
          password: '123', // Senha muito curta
          name: 'Test',
          roles: ['user'],
        })
        .expect(400);
    });
  });
});
