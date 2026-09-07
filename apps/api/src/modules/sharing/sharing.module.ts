import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { SharingService } from './sharing.service';

@Module({
  controllers: [PublicController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
