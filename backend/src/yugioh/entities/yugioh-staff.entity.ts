import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/user.entity';
import { YugiohStaffRole } from '../yugioh.enums';
import { YugiohLeague } from './yugioh-league.entity';

@Entity('yugioh_league_staff') @Unique(['leagueId', 'userId'])
export class YugiohLeagueStaff {
  @PrimaryGeneratedColumn() id: number;
  @Index() @Column() leagueId: number;
  @ManyToOne(() => YugiohLeague, league => league.staff, { onDelete: 'CASCADE' }) league: YugiohLeague;
  @Index() @Column() userId: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @Column({ type: 'enum', enum: YugiohStaffRole }) role: YugiohStaffRole;
}
