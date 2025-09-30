import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'events-service',
            brokers: ['localhost:9092'], // change to your broker(s)
          },
          consumer: {
            groupId: 'events-consumer',
          },
        },
      },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
