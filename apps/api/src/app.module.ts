import { Module } from '@nestjs/common';
import { CalculatorModule } from './modules/calculator/calculator.module';

@Module({
  imports: [CalculatorModule],
})
export class AppModule {}
