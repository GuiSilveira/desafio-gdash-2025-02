import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS', '');
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',')
    : ['http://localhost:5173', 'http://localhost:3001'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-token'],
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('GDASH Weather Monitoring API')
    .setDescription(
      'API para monitoramento de dados meteorológicos com autenticação JWT, gerenciamento de usuários e integração com serviços externos',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Endpoints de autenticação e registro')
    .addTag('users', 'Gerenciamento de usuários (admin)')
    .addTag('weather', 'Dados meteorológicos e análises')
    .addTag('external', 'Integração com APIs externas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('API_PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API rodando na porta ${port}`);
  console.log(`📚 Swagger disponível em http://localhost:${port}/api/docs`);
}

void bootstrap();
