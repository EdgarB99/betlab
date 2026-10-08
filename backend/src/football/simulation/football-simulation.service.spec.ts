import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FootballTeam } from '../entities/football-team.entity';
import { FootballSimulationService, RandomSource } from './football-simulation.service';

const team = (id: number, attack: number, defense: number) => ({ id, name: `Team ${id}`, abbreviation: `T${id}`, attack, defense, overall: Math.round((attack + defense) / 2) }) as FootballTeam;

describe('FootballSimulationService', () => {
  it('calcula una fuerza ponderada reproducible', () => {
    assert.equal(new FootballSimulationService().calculateTeamStrength(team(1, 90, 80)), 85.5);
  });
  it('favorece al equipo claramente superior sin eliminar empate o sorpresa', () => {
    const probability = new FootballSimulationService().calculateWinProbability(team(1, 90, 86), team(2, 65, 68));
    assert.ok(probability.home > probability.away);
    assert.ok(probability.draw > 0 && probability.away > 0);
    assert.ok(Math.abs(probability.home + probability.draw + probability.away - 1) < 0.000001);
  });
  it('permite una simulación determinista mediante RandomSource', () => {
    const random: RandomSource = { next: () => 0.5 };
    const first = new FootballSimulationService(random).simulateMatch(team(1, 80, 80), team(2, 80, 80));
    const second = new FootballSimulationService(random).simulateMatch(team(1, 80, 80), team(2, 80, 80));
    assert.deepEqual(first, second);
  });
});
