import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YugiohLeague } from './entities/yugioh-league.entity';
import { YugiohMatch } from './entities/yugioh-match.entity';
import { YugiohLeagueParticipant } from './entities/yugioh-participant.entity';
import { YugiohPlayer } from './entities/yugioh-player.entity';
import { YugiohRound } from './entities/yugioh-round.entity';
import { YugiohLeagueStaff } from './entities/yugioh-staff.entity';
import { PairingsService } from './pairings.service';
import { StandingsService } from './standings.service';
import { YugiohController } from './yugioh.controller';
import { YugiohService } from './yugioh.service';

@Module({ imports: [TypeOrmModule.forFeature([YugiohLeague, YugiohPlayer, YugiohLeagueParticipant, YugiohRound, YugiohMatch, YugiohLeagueStaff])], controllers: [YugiohController], providers: [YugiohService, PairingsService, StandingsService] })
export class YugiohModule {}
