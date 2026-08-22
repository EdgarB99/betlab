import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'; import { DataSource } from 'typeorm';
@Controller('health') export class HealthController { constructor(private readonly db:DataSource){} @Get() async health(){try{await this.db.query('SELECT 1'); return {status:'ok',database:'up',timestamp:new Date().toISOString()}}catch{throw new ServiceUnavailableException({status:'error',database:'down'})}} }

