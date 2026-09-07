import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export const RSVP_RESPONSES = ['vou', 'levo-alguem', 'nao-vou'] as const;
export type RsvpResponse = (typeof RSVP_RESPONSES)[number];

export class RsvpDto {
  @IsString()
  @Length(1, 60)
  name!: string;

  @IsIn(RSVP_RESPONSES)
  response!: RsvpResponse;

  /** Presente = atualizar a própria resposta anterior */
  @IsOptional()
  @IsString()
  token?: string;
}
