import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { SharingService } from './sharing.service';

@Controller('public')
export class PublicController {
  constructor(private readonly sharing: SharingService) {}

  @Get(':slug')
  invite(@Param('slug') slug: string) {
    return this.sharing.invite(slug);
  }

  @Get(':slug/qrcode')
  @Header('Cache-Control', 'no-store')
  async qrcode(@Param('slug') slug: string, @Res() res: Response): Promise<void> {
    const content = await this.sharing.qrContent(slug);
    const png = await QRCode.toBuffer(content, { width: 480, margin: 1 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="churras-${slug}.png"`);
    res.send(png);
  }
}
