import { Type } from 'class-transformer'; import { IsEnum, IsInt, IsNumber, Max, Min } from 'class-validator'; import { BetSelection } from './bet.entity';
export class CreateBetDto { @Type(()=>Number) @IsInt() @Min(1) eventId:number; @IsEnum(BetSelection) selection:BetSelection; @Type(()=>Number) @IsNumber({maxDecimalPlaces:2}) @Min(1) @Max(1000000) amount:number; }

