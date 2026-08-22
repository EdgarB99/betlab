import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; import { Repository } from 'typeorm'; import { Event, EventStatus } from './event.entity';
@Injectable() export class EventsService implements OnApplicationBootstrap {
  constructor(@InjectRepository(Event) private readonly events: Repository<Event>) {}
  findAll() { return this.events.find({ order: { startDate: 'ASC' } }); }
  async findOne(id: number) { const event = await this.events.findOneBy({ id }); if (!event) throw new NotFoundException('Evento no encontrado'); return event; }
  async onApplicationBootstrap() {
    if (await this.events.count()) return;
    const base = new Date(); base.setUTCDate(base.getUTCDate() + 4); base.setUTCHours(2, 0, 0, 0);
    await this.events.save([
      this.events.create({ league:'Liga MX', homeTeam:'América', awayTeam:'Cruz Azul', startDate:base, status:EventStatus.UPCOMING, homeOdds:'2.10', drawOdds:'3.20', awayOdds:'2.80' }),
      this.events.create({ league:'Liga de Expansión', homeTeam:'Morelia', awayTeam:'Atlante', startDate:new Date(base.getTime()+86400000), status:EventStatus.UPCOMING, homeOdds:'1.90', drawOdds:'3.10', awayOdds:'3.40' }),
      this.events.create({ league:'Liga MX', homeTeam:'Tigres', awayTeam:'Monterrey', startDate:new Date(base.getTime()+172800000), status:EventStatus.UPCOMING, homeOdds:'2.30', drawOdds:'3.00', awayOdds:'2.50' }),
    ]);
  }
}

