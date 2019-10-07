import { Module } from '@nestjs/common';
import { BotModule } from './bot';

@Module({
  imports: [BotModule]
})
export class AppModule {}
