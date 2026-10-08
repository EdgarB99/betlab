import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { YugiohRoundStatus } from '../yugioh.enums';
import { YugiohLeague } from './yugioh-league.entity';
import { YugiohMatch } from './yugioh-match.entity';

@Entity('yugioh_rounds') @Unique(['leagueId', 'number'])
export class YugiohRound {
  @PrimaryGeneratedColumn() id: number;
  @Index() @Column() leagueId: number;
  @ManyToOne(() => YugiohLeague, league => league.rounds, { onDelete: 'CASCADE' }) league: YugiohLeague;
  @Column({ type: 'smallint' }) number: number;
  @Column({ type: 'enum', enum: YugiohRoundStatus, default: YugiohRoundStatus.DRAFT }) status: YugiohRoundStatus;
  @Column({ default: false }) pairingsConfirmed: boolean;
  @CreateDateColumn() createdAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) startedAt: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) completedAt: Date | null;
  @OneToMany(() => YugiohMatch, match => match.round) matches: YugiohMatch[];
}
