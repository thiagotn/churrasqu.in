import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, SignupDto } from './dto/auth.dto';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const toAuthUser = (user: User): AuthUser => ({ id: user.id, name: user.name, email: user.email });

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private issue(user: AuthUser): AuthResult {
    const payload = { sub: user.id, name: user.name, email: user.email };
    return {
      user,
      accessToken: this.jwt.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwt.sign({ ...payload, typ: 'refresh' }, { expiresIn: '30d' }),
    };
  }

  async signup(dto: SignupDto): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { name: dto.name, email: dto.email.toLowerCase(), passwordHash },
      });
      return this.issue(toAuthUser(user));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Este e-mail já tem conta — use "Já tenho conta".');
      }
      throw e;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    return this.issue(toAuthUser(user));
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: { sub: string; typ?: string };
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Token não é de refresh');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Usuário não existe mais');
    return this.issue(toAuthUser(user));
  }
}
