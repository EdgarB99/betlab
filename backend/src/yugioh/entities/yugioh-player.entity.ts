import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { YugiohPlayerStatus } from '../yugioh.enums';
import { YugiohLeagueParticipant } from './yugioh-participant.entity';

@Entity('yugioh_players')
export class YugiohPlayer {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) name: string;
  @Column({ length: 80, nullable: true }) nickname: string | null;
  @Column({ type: 'enum', enum: YugiohPlayerStatus, default: YugiohPlayerStatus.ACTIVE }) status: YugiohPlayerStatus;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => YugiohLeagueParticipant, participant => participant.player) participations: YugiohLeagueParticipant[];
}
