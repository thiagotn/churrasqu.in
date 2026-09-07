import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { AlcoholMode, TierId } from '@churrasquin/calculator';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class AdjustmentsDto {
  @IsOptional()
  @IsObject()
  edits?: Record<string, number | null>;

  @IsOptional()
  @IsObject()
  prices?: Record<string, number>;
}

export class EstimateRequestDto {
  @IsInt()
  @Min(0)
  men!: number;

  @IsInt()
  @Min(0)
  women!: number;

  @IsInt()
  @Min(0)
  kids!: number;

  @Matches(HHMM, { message: 'startTime deve estar no formato HH:mm' })
  startTime!: string;

  @Matches(HHMM, { message: 'endTime deve estar no formato HH:mm' })
  endTime!: string;

  @IsIn(['lista', 'byob', 'bar', 'none'])
  alcoholMode!: AlcoholMode;

  @IsIn(['basico', 'medio', 'gourmet'])
  tier!: TierId;

  @IsOptional()
  @IsPositive()
  beerPerAdultL?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdjustmentsDto)
  adjustments?: AdjustmentsDto;
}
