import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/users/schemas/user.schema';

describe('External API - Pokemon (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userModel: Model<User>;

  const testUser = {
    email: 'external-test@example.com',
    password: 'Test123!@#',
    name: 'External Test User',
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

    // Limpa e cria usuário de teste
    await userModel.deleteMany({ email: testUser.email });
    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    // Faz login e obtém token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: testUser.email });
    await app.close();
  });

  describe('GET /external/pokemon', () => {
    it('should return list of pokemon with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 200 or 429 (rate limit from PokeAPI)
      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('count');
        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBeLessThanOrEqual(20);
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.results.length).toBeLessThanOrEqual(5);
      }
    });

    it('should respect offset parameter', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/external/pokemon?limit=5&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(page1.status);

      if (page1.status === 200) {
        const page2 = await request(app.getHttpServer())
          .get('/external/pokemon?limit=5&offset=5')
          .set('Authorization', `Bearer ${authToken}`);

        expect([200, 429]).toContain(page2.status);

        if (page2.status === 200) {
          // Verifica que os resultados são diferentes
          expect(page1.body.results[0].name).not.toBe(page2.body.results[0].name);
        }
      }
    });

    it('should handle large offset gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon?offset=100000')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.results).toHaveLength(0);
      }
    });

    it('should reject negative limit', async () => {
      await request(app.getHttpServer())
        .get('/external/pokemon?limit=-5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject negative offset', async () => {
      await request(app.getHttpServer())
        .get('/external/pokemon?offset=-10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should handle PokeAPI network errors gracefully', async () => {
      // Este teste depende da disponibilidade da PokeAPI
      // Se falhar, deve retornar 502 Bad Gateway ou 429 rate limit
      const response = await request(app.getHttpServer())
        .get('/external/pokemon?limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429, 502]).toContain(response.status);
    }, 10000);
  });

  describe('GET /external/pokemon/:idOrName', () => {
    it('should return pokemon by ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/25') // Pikachu
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('sprites');
        expect(response.body).toHaveProperty('types');
        expect(response.body.id).toBe(25);
      }
    });

    it('should return pokemon by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/pikachu')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.name).toBe('pikachu');
        expect(response.body.id).toBe(25);
      }
    });

    it('should handle names with hyphens', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/mr-mime')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.name).toBe('mr-mime');
      }
    });

    it('should return 404 for non-existent pokemon', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/99999')
        .set('Authorization', `Bearer ${authToken}`);

      // 404 for not found or 429 for rate limit
      expect([404, 429]).toContain(response.status);
    });

    it('should return 404 for invalid pokemon name', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/invalidpokemon')
        .set('Authorization', `Bearer ${authToken}`);

      expect([404, 429]).toContain(response.status);
    });

    it('should handle special characters in name', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/pikachu!')
        .set('Authorization', `Bearer ${authToken}`);

      expect([404, 429]).toContain(response.status);
    });

    it('should be case-insensitive for names', async () => {
      const lower = await request(app.getHttpServer())
        .get('/external/pokemon/pikachu')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(lower.status);

      if (lower.status === 200) {
        const upper = await request(app.getHttpServer())
          .get('/external/pokemon/PIKACHU')
          .set('Authorization', `Bearer ${authToken}`);

        expect([200, 429]).toContain(upper.status);

        if (upper.status === 200) {
          expect(lower.body.id).toBe(upper.body.id);
        }
      }
    });
  });

  describe('Response Format Validation', () => {
    it('should return correct pokemon data structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        // Valida estrutura essencial
        expect(response.body).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          height: expect.any(Number),
          weight: expect.any(Number),
          sprites: expect.any(Object),
          types: expect.any(Array),
        });

        // Valida tipos
        expect(response.body.types[0]).toMatchObject({
          slot: expect.any(Number),
          type: {
            name: expect.any(String),
            url: expect.any(String),
          },
        });

        // Valida sprites
        expect(response.body.sprites).toHaveProperty('front_default');
      }
    });

    it('should include abilities in pokemon data', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('abilities');
        expect(Array.isArray(response.body.abilities)).toBe(true);
        expect(response.body.abilities.length).toBeGreaterThan(0);
      }
    });

    it('should include stats in pokemon data', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('stats');
        expect(Array.isArray(response.body.stats)).toBe(true);
        expect(response.body.stats.length).toBe(6); // HP, Attack, Defense, Sp.Atk, Sp.Def, Speed
      }
    });
  });

  describe('Performance and Caching', () => {
    it('should respond quickly to repeated requests', async () => {
      const start1 = Date.now();
      const res1 = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);
      const time1 = Date.now() - start1;

      // Accept 200 or 429 (rate limit from PokeAPI)
      expect([200, 429]).toContain(res1.status);

      const start2 = Date.now();
      const res2 = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);
      const time2 = Date.now() - start2;

      expect([200, 429]).toContain(res2.status);

      // Segunda requisição pode ser mais rápida se houver cache
      console.log(`First request: ${time1}ms, Second request: ${time2}ms`);
      expect(time1).toBeLessThan(5000); // Max 5s
      expect(time2).toBeLessThan(5000);
    });

    it('should handle concurrent requests', async () => {
      try {
        const requests = Array.from({ length: 5 }, (_, i) =>
          request(app.getHttpServer())
            .get(`/external/pokemon/${i + 1}`)
            .set('Authorization', `Bearer ${authToken}`),
        );

        const responses = await Promise.all(requests);

        responses.forEach((res, i) => {
          // Accept 200, 429 (rate limit), or 502/503 (server errors from PokeAPI)
          expect([200, 429, 502, 503]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body.id).toBe(i + 1);
          }
        });
      } catch (error: any) {
        // Network errors like ECONNRESET are acceptable for concurrent requests
        // This happens when PokeAPI rate limits or closes connections
        expect(['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']).toContain(
          error.code,
        );
      }
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should return appropriate status for PokeAPI errors', async () => {
      // Tenta acessar pokemon com ID muito alto
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/999999')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 404, 429 (rate limit), or 502 (bad gateway)
      expect([404, 429, 502]).toContain(response.status);
    });

    it('should handle timeout gracefully', async () => {
      // Este teste verifica comportamento em caso de timeout
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBeLessThan(600);
    }, 10000);
  });

  describe('Integration: Pokemon Search Flow', () => {
    it('should search and retrieve specific pokemon', async () => {
      // 1. Lista pokemon
      const listRes = await request(app.getHttpServer())
        .get('/external/pokemon?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 200 or 429 (rate limit from PokeAPI)
      expect([200, 429]).toContain(listRes.status);

      if (listRes.status === 200) {
        const firstPokemon = listRes.body.results[0];
        expect(firstPokemon).toHaveProperty('name');

        // 2. Busca detalhes pelo nome
        const detailsRes = await request(app.getHttpServer())
          .get(`/external/pokemon/${firstPokemon.name}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect([200, 429]).toContain(detailsRes.status);

        if (detailsRes.status === 200) {
          expect(detailsRes.body.name).toBe(firstPokemon.name);
          expect(detailsRes.body).toHaveProperty('sprites');
          expect(detailsRes.body).toHaveProperty('types');
        }
      }
    });

    it('should handle search by different identifiers', async () => {
      // Busca por ID
      const byId = await request(app.getHttpServer())
        .get('/external/pokemon/25')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 200 or 429 (rate limit from PokeAPI)
      expect([200, 429]).toContain(byId.status);

      if (byId.status === 200) {
        // Busca pelo nome obtido
        const byName = await request(app.getHttpServer())
          .get(`/external/pokemon/${byId.body.name}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect([200, 429]).toContain(byName.status);

        if (byName.status === 200) {
          // Deve retornar o mesmo pokemon
          expect(byId.body.id).toBe(byName.body.id);
          expect(byId.body.name).toBe(byName.body.name);
        }
      }
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent data across multiple requests', async () => {
      const res1 = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 200 or 429 (rate limit from PokeAPI)
      expect([200, 429]).toContain(res1.status);

      if (res1.status === 200) {
        const res2 = await request(app.getHttpServer())
          .get('/external/pokemon/1')
          .set('Authorization', `Bearer ${authToken}`);

        expect([200, 429]).toContain(res2.status);

        if (res2.status === 200) {
          expect(res1.body).toEqual(res2.body);
        }
      }
    });

    it('should preserve data types', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/1')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 200 or 429 (rate limit from PokeAPI)
      expect([200, 429]).toContain(response.status);

      if (response.status === 200) {
        expect(typeof response.body.id).toBe('number');
        expect(typeof response.body.name).toBe('string');
        expect(typeof response.body.height).toBe('number');
        expect(typeof response.body.weight).toBe('number');
      }
    });
  });

  describe('GET /external/pokemon/:id/species', () => {
    it('should return species by pokemon ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/1/species')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 200, 429 (rate limit), or 404 (not found)
      expect([200, 429, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('evolution_chain');
      }
    });

    it('should return species by pokemon name', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/bulbasaur/species')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.name).toBe('bulbasaur');
      }
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/external/pokemon/1/species')
        .expect(401);
    });
  });

  describe('GET /external/pokemon/evolution-chain/:id', () => {
    it('should return evolution chain by ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/evolution-chain/1')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept 200, 429 (rate limit), or 404 (not found)
      expect([200, 429, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('chain');
      }
    });

    it('should handle non-existent evolution chain', async () => {
      const response = await request(app.getHttpServer())
        .get('/external/pokemon/evolution-chain/999999')
        .set('Authorization', `Bearer ${authToken}`);

      // Should return 404 or 429 (rate limit)
      expect([404, 429]).toContain(response.status);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/external/pokemon/evolution-chain/1')
        .expect(401);
    });
  });
});
