import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'; import { JwtAuthGuard } from '../auth/jwt-auth.guard'; import { BetsService } from './bets.service'; import { CreateBetDto } from './create-bet.dto';
@UseGuards(JwtAuthGuard) @Controller('bets') export class BetsController { constructor(private readonly bets:BetsService){} @Post() create(@Request() req:{user:{userId:number}},@Body() dto:CreateBetDto){return this.bets.create(req.user.userId,dto)} @Get('me') mine(@Request() req:{user:{userId:number}}){return this.bets.mine(req.user.userId)} }

