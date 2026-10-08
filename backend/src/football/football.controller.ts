import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateLeagueDto, CreateTeamDto, UpdateTeamDto } from './dto/football.dto';
import { FootballService } from './football.service';

@Controller('football')
export class FootballController {
  constructor(private readonly football: FootballService) {}
  @Get('teams') teams() { return this.football.findTeams(); }
  @Post('teams') createTeam(@Body() dto: CreateTeamDto) { return this.football.createTeam(dto); }
  @Patch('teams/:id') updateTeam(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeamDto) { return this.football.updateTeam(id, dto); }
  @Delete('teams/:id') deleteTeam(@Param('id', ParseIntPipe) id: number) { return this.football.deleteTeam(id); }
  @Get('leagues') leagues() { return this.football.findLeagues(); }
  @Post('leagues') createLeague(@Body() dto: CreateLeagueDto) { return this.football.createLeague(dto); }
  @Post('leagues/:id/schedule') schedule(@Param('id', ParseIntPipe) id: number) { return this.football.generateSchedule(id); }
  @Get('matches') matches(@Query('leagueId') leagueId?: string) { return this.football.findMatches(leagueId ? Number(leagueId) : undefined); }
  @Get('matches/:id/probabilities') probabilities(@Param('id', ParseIntPipe) id: number) { return this.football.probabilities(id); }
  @Post('matches/:id/simulate') simulate(@Param('id', ParseIntPipe) id: number) { return this.football.simulateMatch(id); }
  @Post('leagues/:id/rounds/:round/simulate') simulateRound(@Param('id', ParseIntPipe) id: number, @Param('round', ParseIntPipe) round: number) { return this.football.simulateRound(id, round); }
  @Get('leagues/:id/standings') standings(@Param('id', ParseIntPipe) id: number) { return this.football.getStandings(id); }
}
