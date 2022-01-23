import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Demo } from './src/demo';

@Module({
  controllers: [AppController],
  providers: [AppService, Demo],
})
export class AppModule {}
