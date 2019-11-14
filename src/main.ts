import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import 'reflect-metadata';
import { AppModule } from './app';
import { constants } from './constants';

class Server {
  public async bootstrap() {
    // Start nest application
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    // Store the app to future use
    constants.app = app;
    // Listen the port
    await app.listen(3000);
  }
}

// Start point of the application
new Server().bootstrap();
