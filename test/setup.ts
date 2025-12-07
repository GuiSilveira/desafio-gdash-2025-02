import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export default async function globalSetup() {
  // Inicia MongoDB Memory Server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Armazena a URI para os testes usarem
  (global as any).__MONGO_URI__ = uri;
  process.env.MONGODB_URI = uri;

  // Define outras variáveis necessárias
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.INTERNAL_API_TOKEN = 'test-internal-token';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.RABBITMQ_URL = 'amqp://localhost:5672';

  console.log('🧪 MongoDB Memory Server iniciado:', uri);
}
