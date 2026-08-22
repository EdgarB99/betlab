import { Module } from '@nestjs/common'; import { TypeOrmModule } from '@nestjs/typeorm'; import { Event } from '../events/event.entity'; import { User } from '../users/user.entity'; import { Bet } from './bet.entity'; import { BetsController } from './bets.controller'; import { BetsService } from './bets.service';
@Module({imports:[TypeOrmModule.forFeature([Bet,User,Event])],controllers:[BetsController],providers:[BetsService]}) export class BetsModule{}

