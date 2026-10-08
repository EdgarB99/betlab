import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FootballLeague } from './entities/football-league.entity';
import { FootballMatch } from './entities/football-match.entity';
import { FootballTeam } from './entities/football-team.entity';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';
import { ScheduleGeneratorService } from './schedule/schedule-generator.service';
import { FOOTBALL_RANDOM_SOURCE, FootballSimulationService, MathRandomSource } from './simulation/football-simulation.service';
import { StandingsService } from './standings/standings.service';

@Module({
  imports: [TypeOrmModule.forFeature([FootballTeam, FootballLeague, FootballMatch])],
  controllers: [FootballController],
  providers: [FootballService, FootballSimulationService, ScheduleGeneratorService, StandingsService, { provide: FOOTBALL_RANDOM_SOURCE, useClass: MathRandomSource }],
  exports: [FootballSimulationService],
})
export class FootballModule {}
