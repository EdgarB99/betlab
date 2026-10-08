import { Injectable } from '@nestjs/common';
import { FootballMatch, FootballMatchStatus } from '../entities/football-match.entity';
import { FootballTeam } from '../entities/football-team.entity';

export interface StandingRow { team: FootballTeam; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number; }

@Injectable()
export class StandingsService {
  calculate(teams: FootballTeam[], matches: FootballMatch[]): StandingRow[] {
    const rows = new Map(teams.map(team => [team.id, { team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }]));
    for (const match of matches.filter(m => m.status === FootballMatchStatus.FINISHED && m.homeGoals !== null && m.awayGoals !== null)) {
      const home = rows.get(match.homeTeamId), away = rows.get(match.awayTeamId); if (!home || !away) continue;
      home.played++; away.played++; home.goalsFor += match.homeGoals!; home.goalsAgainst += match.awayGoals!; away.goalsFor += match.awayGoals!; away.goalsAgainst += match.homeGoals!;
      if (match.homeGoals! > match.awayGoals!) { home.won++; away.lost++; home.points += 3; }
      else if (match.homeGoals! < match.awayGoals!) { away.won++; home.lost++; away.points += 3; }
      else { home.drawn++; away.drawn++; home.points++; away.points++; }
    }
    for (const row of rows.values()) row.goalDifference = row.goalsFor - row.goalsAgainst;
    return [...rows.values()].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.team.name.localeCompare(b.team.name));
  }
}
