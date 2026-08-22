import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}
  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) throw new ConflictException('El correo ya está registrado');
    const user = await this.users.create({ name: dto.name.trim(), email: dto.email.toLowerCase(), passwordHash: await bcrypt.hash(dto.password, 12) });
    return this.token(user.id, user.email, user.name);
  }
  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email, true);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Credenciales inválidas');
    return this.token(user.id, user.email, user.name);
  }
  private async token(id: number, email: string, name: string) { return { accessToken: await this.jwt.signAsync({ sub: id, email }), user: { id, email, name } }; }
}

