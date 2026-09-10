import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { CalculatorService } from './calculator.service';

@Module({
  imports: [CatalogModule],
  providers: [CalculatorService],
  exports: [CalculatorService],
})
export class CalculatorModule {}
