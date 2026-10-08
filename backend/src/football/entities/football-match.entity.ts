import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FootballLeague } from './football-league.entity';
import { FootballTeam } from './football-team.entity';

export enum FootballMatchStatus { PENDING = 'PENDING', FINISHED = 'FINISHED' }

@Entity('football_matches')
@Unique(['leagueId', 'homeTeamId', 'awayTeamId'])
export class FootballMatch {
  @PrimaryGeneratedColumn() id: number;
  @Column() leagueId: number;
  @ManyToOne(() => FootballLeague, (league) => league.matches, { onDelete: 'CASCADE' }) league: FootballLeague;
  @Column() round: number;
  @Column() homeTeamId: number;
  @ManyToOne(() => FootballTeam, { onDelete: 'RESTRICT' }) homeTeam: FootballTeam;
  @Column() awayTeamId: number;
  @ManyToOne(() => FootballTeam, { onDelete: 'RESTRICT' }) awayTeam: FootballTeam;
  @Column({ type: 'smallint', nullable: true }) homeGoals: number | null;
  @Column({ type: 'smallint', nullable: true }) awayGoals: number | null;
  @Column({ type: 'enum', enum: FootballMatchStatus, default: FootballMatchStatus.PENDING }) status: FootballMatchStatus;
  @Column({ type: 'timestamptz', nullable: true }) scheduledAt: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) playedAt: Date | null;
  @CreateDateColumn() createdAt: Date;
}
