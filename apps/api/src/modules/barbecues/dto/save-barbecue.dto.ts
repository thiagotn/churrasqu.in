import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { EstimateRequestDto } from './estimate.dto';

export class SaveBarbecueDto extends EstimateRequestDto {
  @IsString()
  @Length(1, 80)
  eventName!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'eventDay deve estar no formato yyyy-mm-dd' })
  eventDay!: string;

  @IsString()
  @Length(0, 160)
  eventAddress!: string;

  @IsString()
  @Length(0, 120)
  eventCity!: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  eventHint?: string;
}
