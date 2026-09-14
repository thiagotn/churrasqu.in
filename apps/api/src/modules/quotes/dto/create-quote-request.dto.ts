import { Equals, IsOptional, IsString, Length, Matches } from 'class-validator';
import { EstimateRequestDto } from '../../barbecues/dto/estimate.dto';

export class CreateQuoteRequestDto extends EstimateRequestDto {
  @IsString()
  @Length(1, 80)
  contactName!: string;

  /** Formato livre; normalizado para E.164 no service (só celular). */
  @IsString()
  @Length(8, 20)
  whatsapp!: string;

  @Equals(true, { message: 'É preciso aceitar o contato pelo WhatsApp para receber orçamentos.' })
  consent!: boolean;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'eventDay deve estar no formato yyyy-mm-dd' })
  eventDay!: string;

  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP deve ter 8 dígitos' })
  cep!: string;

  @IsString()
  @Length(1, 120)
  eventCity!: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  eventAddress?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  eventHint?: string;

  /** Honeypot: campo invisível no front; bot que preenche não grava nada. */
  @IsOptional()
  @IsString()
  website?: string;
}
