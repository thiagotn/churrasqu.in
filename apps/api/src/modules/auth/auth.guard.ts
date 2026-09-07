import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  typ?: string;
}

export type AuthedRequest = Request & { user: JwtPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const [scheme, token] = String(req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Faça login para salvar seu churras');
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      if (payload.typ === 'refresh') throw new Error('refresh token não autentica');
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Sessão expirada — entre de novo');
    }
  }
}
