import { Injectable } from '@nestjs/common';

export interface ScheduledPair { round: number; homeTeamId: number; awayTeamId: number; }

@Injectable()
export class ScheduleGeneratorService {
  generate(teamIds: number[]): ScheduledPair[] {
    if (new Set(teamIds).size !== teamIds.length) throw new Error('Los equipos no pueden repetirse');
    const teams: Array<number | null> = [...teamIds];
    if (teams.length % 2) teams.push(null);
    const matches: ScheduledPair[] = [];
    for (let round = 1; round < teams.length; round++) {
      for (let i = 0; i < teams.length / 2; i++) {
        const left = teams[i], right = teams[teams.length - 1 - i];
        if (left !== null && right !== null) {
          const swap = (round + i) % 2 === 0;
          matches.push({ round, homeTeamId: swap ? right : left, awayTeamId: swap ? left : right });
        }
      }
      teams.splice(1, 0, teams.pop()!);
    }
    return matches;
  }
}
