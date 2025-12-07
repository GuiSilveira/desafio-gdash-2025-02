import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown() {
  const uri = (global as any).__MONGO_URI__;

  if (uri) {
    // Para o MongoDB Memory Server
    const mongod = await MongoMemoryServer.create();
    await mongod.stop();
    console.log('🛑 MongoDB Memory Server fechado');
  }
}
