import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CalculatorModule } from '../calculator/calculator.module';
import { BarbecuesController } from './barbecues.controller';
import { BarbecuesService } from './barbecues.service';

@Module({
  imports: [CalculatorModule, AuthModule],
  controllers: [BarbecuesController],
  providers: [BarbecuesService],
})
export class BarbecuesModule {}
