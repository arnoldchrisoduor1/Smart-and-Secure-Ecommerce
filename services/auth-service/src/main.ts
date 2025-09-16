import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from "@nestjs/common";
import { ConfigService, ConfigService } from "@nestjs/config";
import { MicroserviceOptions, Transport } from "@nestjs/common/interfaces/microservices/nest-microservice-options.interface";
import { DocummentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
}