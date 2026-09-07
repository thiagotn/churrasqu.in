import { Module } from '@nestjs/common';
import { BarbecuesModule } from './modules/barbecues/barbecues.module';
import { CalculatorModule } from './modules/calculator/calculator.module';
import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [CalculatorModule, CatalogModule, BarbecuesModule],
})
export class AppModule {}
