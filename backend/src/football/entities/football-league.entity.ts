import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FootballMatch } from './football-match.entity';
import { FootballTeam } from './football-team.entity';

export enum LeagueFormat { SINGLE_ROUND_ROBIN = 'SINGLE_ROUND_ROBIN' }
export enum LeagueStatus { DRAFT = 'DRAFT', SCHEDULED = 'SCHEDULED', IN_PROGRESS = 'IN_PROGRESS', FINISHED = 'FINISHED' }

@Entity('football_leagues')
export class FootballLeague {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) name: string;
  @Column({ type: 'enum', enum: LeagueFormat, default: LeagueFormat.SINGLE_ROUND_ROBIN }) format: LeagueFormat;
  @Column({ type: 'enum', enum: LeagueStatus, default: LeagueStatus.DRAFT }) status: LeagueStatus;
  @ManyToMany(() => FootballTeam)
  @JoinTable({ name: 'football_league_teams' }) teams: FootballTeam[];
  @OneToMany(() => FootballMatch, (match) => match.league) matches: FootballMatch[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
