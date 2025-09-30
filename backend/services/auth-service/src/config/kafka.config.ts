import { KafkaOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export const getKafkaConfig = (configService: ConfigService): KafkaOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: configService.get('KAFKA_CLIENT_ID', 'auth-service'),
      brokers: [configService.get('KAFKA_BROKER', 'localhost:9092')],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    },
    consumer: {
      groupId: configService.get('KAFKA_GROUP_ID', 'auth-service-group'),
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    },
    producer: {
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
      allowAutoTopicCreation: true,
    },
  },
});