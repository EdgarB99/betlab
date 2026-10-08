import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Length, Max, Min, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsString() @MinLength(2) name: string;
  @IsString() @Length(2, 5) abbreviation: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) attack: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) defense: number;
}

export class UpdateTeamDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() @Length(2, 5) abbreviation?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) attack?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) defense?: number;
}

export class CreateLeagueDto {
  @IsString() @MinLength(2) name: string;
  @IsArray() @ArrayMinSize(2) @IsInt({ each: true }) teamIds: number[];
}
