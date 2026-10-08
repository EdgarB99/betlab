import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FootballMatch, FootballMatchStatus } from '../entities/football-match.entity';
import { FootballTeam } from '../entities/football-team.entity';
import { StandingsService } from './standings.service';

const team = (id: number, name: string) => ({ id, name, abbreviation: name.slice(0, 3), attack: 75, defense: 75, overall: 75 }) as FootballTeam;
const match = (homeTeamId: number, awayTeamId: number, homeGoals: number, awayGoals: number) => ({ homeTeamId, awayTeamId, homeGoals, awayGoals, status: FootballMatchStatus.FINISHED }) as FootballMatch;

describe('StandingsService', () => {
  it('actualiza estadísticas, puntos, diferencia y orden', () => {
    const rows = new StandingsService().calculate([team(1, 'Alpha'), team(2, 'Beta'), team(3, 'Gamma')], [match(1, 2, 2, 0), match(2, 3, 1, 1)]);
    assert.equal(rows[0].team.id, 1); assert.equal(rows[0].points, 3); assert.equal(rows[0].goalDifference, 2);
    assert.equal(rows[1].team.id, 3); assert.equal(rows[1].points, 1);
    assert.equal(rows[2].played, 2); assert.equal(rows[2].goalsAgainst, 3);
  });
});
