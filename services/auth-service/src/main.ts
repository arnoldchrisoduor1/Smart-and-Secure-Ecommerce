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
    })
  )
}