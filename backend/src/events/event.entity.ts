import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bet } from '../bets/bet.entity';
export enum EventStatus { UPCOMING='UPCOMING', LIVE='LIVE', FINISHED='FINISHED', CANCELLED='CANCELLED' }
@Entity('events') export class Event {
  @PrimaryGeneratedColumn() id: number;
  @Column() homeTeam: string; @Column() awayTeam: string; @Column() league: string;
  @Column({ type: 'timestamptz' }) startDate: Date;
  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.UPCOMING }) status: EventStatus;
  @Column('decimal', { precision: 6, scale: 2 }) homeOdds: string;
  @Column('decimal', { precision: 6, scale: 2 }) drawOdds: string;
  @Column('decimal', { precision: 6, scale: 2 }) awayOdds: string;
  @OneToMany(() => Bet, (bet) => bet.event) bets: Bet[];
}

