import { Injectable } from '@nestjs/common';
import { TIERS, TierSeed } from '@churrasquin/calculator';

@Injectable()
export class CatalogService {
  /** Seed de referência dos níveis. Na fatia 3 passa a ler do banco. */
  tiers(): TierSeed[] {
    return Object.values(TIERS);
  }
}
