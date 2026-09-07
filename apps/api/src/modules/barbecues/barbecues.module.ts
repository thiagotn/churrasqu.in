import { Module } from '@nestjs/common';
import { CalculatorModule } from '../calculator/calculator.module';
import { BarbecuesController } from './barbecues.controller';

@Module({
  imports: [CalculatorModule],
  controllers: [BarbecuesController],
})
export class BarbecuesModule {}
