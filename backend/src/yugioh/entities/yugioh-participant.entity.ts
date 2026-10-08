import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { YugiohPlayerStatus } from '../yugioh.enums';
import { YugiohLeague } from './yugioh-league.entity';
import { YugiohPlayer } from './yugioh-player.entity';

@Entity('yugioh_league_participants') @Unique(['leagueId', 'playerId'])
export class YugiohLeagueParticipant {
  @PrimaryGeneratedColumn() id: number;
  @Index() @Column() leagueId: number;
  @ManyToOne(() => YugiohLeague, league => league.participants, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'leagueId' }) league: YugiohLeague;
  @Index() @Column() playerId: number;
  @ManyToOne(() => YugiohPlayer, player => player.participations, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'playerId' }) player: YugiohPlayer;
  @Column({ type: 'enum', enum: YugiohPlayerStatus, default: YugiohPlayerStatus.ACTIVE }) status: YugiohPlayerStatus;
  @CreateDateColumn() joinedAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) retiredAt: Date | null;
}
