/**
 * Configuração de banco de dados para testes E2E
 *
 * Este helper usa MongoDB Memory Server (em memória) por padrão
 * ou MongoDB real se MONGODB_URI estiver definido.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

/**
 * Retorna URI do MongoDB para testes
 *
 * Prioridade:
 * 1. Se MONGODB_URI estiver definido → usa MongoDB real
 * 2. Caso contrário → usa mongodb-memory-server (em memória)
 */
export async function getMongoUri(): Promise<string> {
  // Se tem MONGODB_URI definido, usa ele (MongoDB real)
  if (process.env.MONGODB_URI) {
    console.log(`🔧 Usando MongoDB real: ${process.env.MONGODB_URI}`);
    return process.env.MONGODB_URI;
  }

  // Caso contrário, usa MongoDB Memory Server
  if (!mongod) {
    console.log('🧪 Iniciando MongoDB Memory Server...');
    mongod = await MongoMemoryServer.create();
  }

  const uri = mongod.getUri();
  console.log(`✅ MongoDB Memory Server pronto: ${uri}`);
  return uri;
}

/**
 * Fecha MongoDB Memory Server (se estiver rodando)
 */
export async function closeMongoConnection(): Promise<void> {
  if (mongod) {
    console.log('🛑 Fechando MongoDB Memory Server...');
    await mongod.stop();
    mongod = null;
  }
}

/**
 * Limpa todos os dados do banco de teste
 */
export async function clearDatabase(mongooseConnection: any): Promise<void> {
  if (!mongooseConnection) return;

  const collections = mongooseConnection.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}
