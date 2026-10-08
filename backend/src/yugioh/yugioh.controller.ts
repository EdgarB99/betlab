import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddParticipantDto, AddStaffDto, CreateLeagueDto, ReplacePairingsDto, ResultDto, UpdateLeagueDto, UpdateParticipantDto } from './dto/yugioh.dto';
import { YugiohService } from './yugioh.service';

type AuthRequest = { user: { userId: number } };
@Controller('yugioh')
export class YugiohController {
  constructor(private readonly yugioh: YugiohService) {}
  @Get('leagues') leagues() { return this.yugioh.listLeagues(); }
  @Get('leagues/:id') league(@Param('id', ParseIntPipe) id: number) { return this.yugioh.getLeague(id); }
  @Get('leagues/:id/participants') participants(@Param('id', ParseIntPipe) id: number) { return this.yugioh.listParticipants(id); }
  @Get('leagues/:id/rounds') rounds(@Param('id', ParseIntPipe) id: number) { return this.yugioh.listRounds(id); }
  @Get('leagues/:id/standings') standings(@Param('id', ParseIntPipe) id: number) { return this.yugioh.getStandings(id); }
  @Get('rounds/:id') round(@Param('id', ParseIntPipe) id: number) { return this.yugioh.getRound(id); }
  @Get('players/:id') player(@Param('id', ParseIntPipe) id: number) { return this.yugioh.playerProfile(id); }

  @UseGuards(JwtAuthGuard) @Post('leagues') create(@Request() req: AuthRequest, @Body() dto: CreateLeagueDto) { return this.yugioh.createLeague(req.user.userId, dto); }
  @UseGuards(JwtAuthGuard) @Patch('leagues/:id') update(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeagueDto) { return this.yugioh.updateLeague(req.user.userId, id, dto); }
  @UseGuards(JwtAuthGuard) @Post('leagues/:id/finish') finish(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) { return this.yugioh.finish(req.user.userId, id); }
  @UseGuards(JwtAuthGuard) @Post('leagues/:id/reopen') reopen(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) { return this.yugioh.reopen(req.user.userId, id); }
  @UseGuards(JwtAuthGuard) @Post('leagues/:id/participants') addParticipant(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: AddParticipantDto) { return this.yugioh.addParticipant(req.user.userId, id, dto); }
  @UseGuards(JwtAuthGuard) @Patch('leagues/:id/participants/:participantId') updateParticipant(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Param('participantId', ParseIntPipe) participantId: number, @Body() dto: UpdateParticipantDto) { return this.yugioh.updateParticipant(req.user.userId, id, participantId, dto); }
  @UseGuards(JwtAuthGuard) @Post('leagues/:id/rounds') createRound(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) { return this.yugioh.createRound(req.user.userId, id); }
  @UseGuards(JwtAuthGuard) @Post('rounds/:id/generate-pairings') generate(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) { return this.yugioh.generatePairings(req.user.userId, id); }
  @UseGuards(JwtAuthGuard) @Patch('rounds/:id/pairings') pairings(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: ReplacePairingsDto) { return this.yugioh.replacePairings(req.user.userId, id, dto); }
  @UseGuards(JwtAuthGuard) @Post('rounds/:id/confirm') confirm(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) { return this.yugioh.confirmPairings(req.user.userId, id); }
  @UseGuards(JwtAuthGuard) @Patch('matches/:id/result') result(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: ResultDto) { return this.yugioh.reportResult(req.user.userId, id, dto); }
  @UseGuards(JwtAuthGuard) @Post('leagues/:id/staff') staff(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: AddStaffDto) { return this.yugioh.addStaff(req.user.userId, id, dto); }
  @UseGuards(JwtAuthGuard) @Get('leagues/:id/export') export(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) { return this.yugioh.exportLeague(req.user.userId, id); }
}
