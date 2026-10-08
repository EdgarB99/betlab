import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { YugiohMatchStatus } from '../yugioh.enums';
import { YugiohLeagueParticipant } from './yugioh-participant.entity';
import { YugiohRound } from './yugioh-round.entity';

@Entity('yugioh_matches') @Unique(['roundId', 'tableNumber'])
@Check(`("isBye" = false AND "playerBId" IS NOT NULL) OR ("isBye" = true AND "playerBId" IS NULL)`)
@Check(`"playerAId" <> "playerBId"`)
export class YugiohMatch {
  @PrimaryGeneratedColumn() id: number;
  @Index() @Column() roundId: number;
  @ManyToOne(() => YugiohRound, round => round.matches, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'roundId' }) round: YugiohRound;
  @Column({ type: 'smallint' }) tableNumber: number;
  @Column() playerAId: number;
  @ManyToOne(() => YugiohLeagueParticipant, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'playerAId' }) playerA: YugiohLeagueParticipant;
  @Column({ nullable: true }) playerBId: number | null;
  @ManyToOne(() => YugiohLeagueParticipant, { nullable: true, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'playerBId' }) playerB: YugiohLeagueParticipant | null;
  @Column({ type: 'smallint', nullable: true }) playerAScore: number | null;
  @Column({ type: 'smallint', nullable: true }) playerBScore: number | null;
  @Column({ nullable: true }) winnerId: number | null;
  @Column({ type: 'enum', enum: YugiohMatchStatus, default: YugiohMatchStatus.PENDING }) status: YugiohMatchStatus;
  @Column({ default: false }) isBye: boolean;
  @Column({ default: false }) isAdministrative: boolean;
  @Column({ type: 'timestamptz', nullable: true }) completedAt: Date | null;
  @Column({ nullable: true }) reportedByUserId: number | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
