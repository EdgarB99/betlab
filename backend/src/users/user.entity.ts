import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bet } from '../bets/bet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @Column() name: string;
  @Column({ select: false }) passwordHash: string;
  @Column('decimal', { precision: 12, scale: 2, default: 1000 }) balance: string;
  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => Bet, (bet) => bet.user) bets: Bet[];
}

