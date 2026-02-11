import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();
  const fronEndUrl = configService.get<string>('FRONTEND_URL')!;

  app.enableCors({
    origin: fronEndUrl,
    credentials: true,
  });
  app.use(helmet());
  // app.useGlobalGuards()
  app.setGlobalPrefix('api'); // this make all endpoint start with {/api}
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  ); // this for make validation pip is global

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('E-Shop API')
    .setDescription('API documentation for my backend project')
    .setVersion('1.0')
    .addBearerAuth() // مهم لو عندك JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
