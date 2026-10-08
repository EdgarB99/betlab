import { Inject, Injectable, Optional } from '@nestjs/common';
import { FootballTeam } from '../entities/football-team.entity';

export interface RandomSource { next(): number; }
export class MathRandomSource implements RandomSource { next() { return Math.random(); } }
export const FOOTBALL_RANDOM_SOURCE = 'FOOTBALL_RANDOM_SOURCE';
export interface MatchProbabilities { home: number; draw: number; away: number; }
export interface SimulatedScore { homeGoals: number; awayGoals: number; probabilities: MatchProbabilities; }

@Injectable()
export class FootballSimulationService {
  private readonly random: RandomSource;
  constructor(@Optional() @Inject(FOOTBALL_RANDOM_SOURCE) random?: RandomSource) { this.random = random ?? new MathRandomSource(); }

  calculateTeamStrength(team: Pick<FootballTeam, 'attack' | 'defense'>): number {
    return team.attack * 0.55 + team.defense * 0.45;
  }

  calculateExpectedGoals(home: FootballTeam, away: FootballTeam): { home: number; away: number } {
    const homeAttack = home.attack / Math.max(away.defense, 25);
    const awayAttack = away.attack / Math.max(home.defense, 25);
    const strengthGap = (this.calculateTeamStrength(home) - this.calculateTeamStrength(away)) / 100;
    return {
      home: this.clamp(1.22 * homeAttack + 0.34 + strengthGap * 0.65, 0.2, 4.2),
      away: this.clamp(1.16 * awayAttack - strengthGap * 0.65, 0.2, 4.2),
    };
  }

  calculateWinProbability(home: FootballTeam, away: FootballTeam): MatchProbabilities {
    const expected = this.calculateExpectedGoals(home, away);
    let homeWin = 0, draw = 0, awayWin = 0;
    for (let h = 0; h <= 10; h++) for (let a = 0; a <= 10; a++) {
      const p = this.poissonProbability(h, expected.home) * this.poissonProbability(a, expected.away);
      if (h > a) homeWin += p; else if (h === a) draw += p; else awayWin += p;
    }
    const total = homeWin + draw + awayWin;
    return { home: homeWin / total, draw: draw / total, away: awayWin / total };
  }

  simulateMatch(home: FootballTeam, away: FootballTeam): SimulatedScore {
    const expected = this.calculateExpectedGoals(home, away);
    return { homeGoals: this.samplePoisson(expected.home), awayGoals: this.samplePoisson(expected.away), probabilities: this.calculateWinProbability(home, away) };
  }

  private samplePoisson(lambda: number): number {
    const limit = Math.exp(-lambda); let product = 1; let value = 0;
    do { value++; product *= this.random.next(); } while (product > limit && value < 15);
    return value - 1;
  }
  private poissonProbability(k: number, lambda: number) { return Math.exp(-lambda) * Math.pow(lambda, k) / this.factorial(k); }
  private factorial(value: number) { let result = 1; for (let i = 2; i <= value; i++) result *= i; return result; }
  private clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
}
