import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const logger = new Logger(AppModule.name);
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mercado Express API')
    .setDescription(
      'Documentacion de endpoints para productos, alertas, ordenes de compra y movimientos de stock.',
    )
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Mercado Express API Docs',
  });

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  logger.log(`📘 Swagger docs available at: ${await app.getUrl()}/api/docs`);
}
void bootstrap();
