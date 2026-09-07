import { Module } from '@nestjs/common';
import { RsvpModule } from '../rsvp/rsvp.module';
import { PublicController } from './public.controller';
import { SharingService } from './sharing.service';

@Module({
  imports: [RsvpModule],
  controllers: [PublicController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
