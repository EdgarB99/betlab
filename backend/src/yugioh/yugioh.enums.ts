export enum YugiohLeagueStatus { DRAFT = 'DRAFT', ACTIVE = 'ACTIVE', FINISHED = 'FINISHED' }
export enum YugiohFormat { GOAT = 'GOAT', EDISON = 'EDISON', ADVANCED = 'ADVANCED', SPEED_DUEL = 'SPEED_DUEL', OTHER = 'OTHER' }
export enum YugiohPlayerStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE', RETIRED = 'RETIRED' }
export enum YugiohRoundStatus { DRAFT = 'DRAFT', IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED' }
export enum YugiohMatchStatus { PENDING = 'PENDING', COMPLETED = 'COMPLETED' }
export enum YugiohStaffRole { ADMIN = 'ADMIN', STAFF = 'STAFF' }

export interface ScoringConfig { winPoints: number; drawPoints: number; lossPoints: number; byePoints: number; allowDraws: boolean; validScores: string[] }
export interface PairingConfig { avoidRematches: boolean; avoidRepeatedByes: boolean }
export const DEFAULT_SCORING: ScoringConfig = { winPoints: 3, drawPoints: 1, lossPoints: 0, byePoints: 3, allowDraws: true, validScores: ['2-0', '2-1', '1-2', '0-2', '1-1'] };
export const DEFAULT_PAIRING: PairingConfig = { avoidRematches: true, avoidRepeatedByes: true };
