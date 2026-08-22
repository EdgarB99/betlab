import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'; import { EventsService } from './events.service';
@Controller('events') export class EventsController { constructor(private readonly events: EventsService) {} @Get() all() { return this.events.findAll(); } @Get(':id') one(@Param('id', ParseIntPipe) id:number) { return this.events.findOne(id); } }

