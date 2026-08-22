import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}
  findByEmail(email: string, withPassword = false) { return this.users.createQueryBuilder('user').where('LOWER(user.email) = LOWER(:email)', { email }).addSelect(withPassword ? 'user.passwordHash' : 'user.id').getOne(); }
  findById(id: number) { return this.users.findOneBy({ id }); }
  create(data: Pick<User, 'email' | 'name' | 'passwordHash'>) { return this.users.save(this.users.create(data)); }
}

