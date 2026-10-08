import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { YugiohFormat, YugiohPlayerStatus, YugiohStaffRole } from '../yugioh.enums';

export class ScoringConfigDto {
  @IsInt() @Min(0) @Max(20) winPoints: number;
  @IsInt() @Min(0) @Max(20) drawPoints: number;
  @IsInt() @Min(0) @Max(20) lossPoints: number;
  @IsInt() @Min(0) @Max(20) byePoints: number;
  @IsBoolean() allowDraws: boolean;
  @IsArray() @IsString({ each: true }) validScores: string[];
}
export class CreateLeagueDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @IsString() @IsOptional() @MaxLength(2000) description?: string;
  @IsEnum(YugiohFormat) format: YugiohFormat;
  @IsString() @IsNotEmpty() @MaxLength(80) season: string;
  @IsOptional() @ValidateNested() @Type(() => ScoringConfigDto) scoringConfig?: ScoringConfigDto;
}
export class UpdateLeagueDto {
  @IsString() @IsOptional() @IsNotEmpty() @MaxLength(120) name?: string;
  @IsString() @IsOptional() @MaxLength(2000) description?: string;
  @IsEnum(YugiohFormat) @IsOptional() format?: YugiohFormat;
  @IsString() @IsOptional() @IsNotEmpty() @MaxLength(80) season?: string;
  @IsOptional() @ValidateNested() @Type(() => ScoringConfigDto) scoringConfig?: ScoringConfigDto;
}
export class AddParticipantDto {
  @IsInt() @Min(1) @IsOptional() playerId?: number;
  @IsString() @IsNotEmpty() @MaxLength(100) @IsOptional() name?: string;
  @IsString() @MaxLength(80) @IsOptional() nickname?: string;
}
export class UpdateParticipantDto { @IsEnum(YugiohPlayerStatus) status: YugiohPlayerStatus; }
export class PairingDto { @IsInt() @Min(1) playerAId: number; @IsInt() @Min(1) @IsOptional() playerBId?: number | null; }
export class ReplacePairingsDto { @IsArray() @ValidateNested({ each: true }) @Type(() => PairingDto) pairings: PairingDto[]; }
export class ResultDto {
  @IsInt() @Min(0) @Max(9) playerAScore: number;
  @IsInt() @Min(0) @Max(9) playerBScore: number;
  @IsBoolean() @IsOptional() administrative?: boolean;
}
export class AddStaffDto { @IsInt() @Min(1) userId: number; @IsEnum(YugiohStaffRole) role: YugiohStaffRole; }
