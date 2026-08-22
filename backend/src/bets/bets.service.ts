import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'; import { DataSource } from 'typeorm'; import { Event, EventStatus } from '../events/event.entity'; import { User } from '../users/user.entity'; import { Bet, BetSelection, BetStatus } from './bet.entity'; import { CreateBetDto } from './create-bet.dto';
@Injectable() export class BetsService {
  constructor(private readonly dataSource:DataSource) {}
  async create(userId:number,dto:CreateBetDto) { return this.dataSource.transaction(async manager => {
    const user=await manager.getRepository(User).createQueryBuilder('user').setLock('pessimistic_write').where('user.id = :userId',{userId}).getOne();
    if(!user) throw new NotFoundException('Usuario no encontrado');
    const event=await manager.findOneBy(Event,{id:dto.eventId}); if(!event) throw new NotFoundException('Evento no encontrado');
    if(event.status!==EventStatus.UPCOMING || new Date(event.startDate)<=new Date()) throw new BadRequestException('El evento ya no acepta apuestas');
    const amount=Math.round(dto.amount*100)/100; if(Number(user.balance)<amount) throw new BadRequestException('Saldo insuficiente');
    const odds=Number(event[dto.selection===BetSelection.HOME?'homeOdds':dto.selection===BetSelection.DRAW?'drawOdds':'awayOdds']);
    const payout=Math.round(amount*odds*100)/100; user.balance=(Number(user.balance)-amount).toFixed(2); await manager.save(user);
    return manager.save(manager.create(Bet,{userId,eventId:event.id,selection:dto.selection,odds:odds.toFixed(2),amount:amount.toFixed(2),potentialPayout:payout.toFixed(2),status:BetStatus.PENDING}));
  }); }
  mine(userId:number) { return this.dataSource.getRepository(Bet).find({where:{userId},relations:{event:true},order:{createdAt:'DESC'}}); }
}

