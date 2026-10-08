import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ScheduleGeneratorService } from './schedule-generator.service';

describe('ScheduleGeneratorService', () => {
  it('genera cada pareja una sola vez y n-1 jornadas para equipos pares', () => {
    const schedule = new ScheduleGeneratorService().generate([1, 2, 3, 4]);
    assert.equal(schedule.length, 6);
    assert.equal(new Set(schedule.map(m => m.round)).size, 3);
    assert.equal(new Set(schedule.map(m => [m.homeTeamId, m.awayTeamId].sort().join('-'))).size, 6);
  });
  it('maneja equipos impares mediante una jornada de descanso', () => {
    const schedule = new ScheduleGeneratorService().generate([1, 2, 3]);
    assert.equal(schedule.length, 3);
    assert.equal(new Set(schedule.map(m => m.round)).size, 3);
  });
});
