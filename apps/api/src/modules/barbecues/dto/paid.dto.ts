import { IsBoolean } from 'class-validator';

export class RsvpPaidDto {
  @IsBoolean()
  paid!: boolean;
}

export class PaidVisibilityDto {
  @IsBoolean()
  showPaidPublicly!: boolean;
}
