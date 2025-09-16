import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from "@nestjs/common";
import { ConfigService, ConfigService } from "@nestjs/config";
import { MicroserviceOptions, Transport } from "@nestjs/common/interfaces/microservices/nest-microservice-options.interface";
import { DocummentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3001);
  const kafkaBroker = configService.get('KAFKA_BROKER', 'localhost:9092');

  // setting up for global validation.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocummentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and authorization microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-service',
        brokers: [kafkaBroker],
      },
      consumer: {
        groupId: 'auth-service-group',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);

  console.log(`Auth service is running on: hhtp:/localhost:${port}`);
  console.log(`API Docummentation: http://localhost:${port}/api/docs`);

}