import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { DEFAULT_PAIRING, DEFAULT_SCORING, PairingConfig, ScoringConfig, YugiohFormat, YugiohLeagueStatus } from '../yugioh.enums';
import { YugiohLeagueParticipant } from './yugioh-participant.entity';
import { YugiohRound } from './yugioh-round.entity';
import { YugiohLeagueStaff } from './yugioh-staff.entity';

@Entity('yugioh_leagues')
export class YugiohLeague {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 120 }) name: string;
  @Index({ unique: true }) @Column({ length: 140 }) slug: string;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ type: 'enum', enum: YugiohFormat }) format: YugiohFormat;
  @Column({ length: 80 }) season: string;
  @Column({ type: 'enum', enum: YugiohLeagueStatus, default: YugiohLeagueStatus.DRAFT }) status: YugiohLeagueStatus;
  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(DEFAULT_SCORING)}'::jsonb` }) scoringConfig: ScoringConfig;
  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(DEFAULT_PAIRING)}'::jsonb` }) pairingConfig: PairingConfig;
  @Column() createdByUserId: number;
  @Column({ type: 'timestamptz', nullable: true }) finishedAt: Date | null;
  @Column({ type: 'jsonb', nullable: true }) finalPodium: { championId: number; runnerUpId?: number; thirdId?: number } | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => YugiohLeagueParticipant, participant => participant.league) participants: YugiohLeagueParticipant[];
  @OneToMany(() => YugiohRound, round => round.league) rounds: YugiohRound[];
  @OneToMany(() => YugiohLeagueStaff, staff => staff.league) staff: YugiohLeagueStaff[];
}
