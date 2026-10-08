import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { PairingsService } from './pairings.service';

const service = new PairingsService();
describe('PairingsService', () => {
  it('empareja una cantidad par sin duplicados', () => { const result = service.generate([1,2,3,4].map(id => ({ id, points: 0, opponents: [], byes: 0 }))); assert.equal(result.length, 2); assert.equal(new Set(result.flatMap(p => [p.playerAId, p.playerBId])).size, 4); });
  it('crea exactamente un BYE para una cantidad impar', () => { const result = service.generate([1,2,3].map(id => ({ id, points: 0, opponents: [], byes: 0 }))); assert.equal(result.filter(p => p.isBye).length, 1); });
  it('evita repetir BYE cuando existe alternativa', () => { const result = service.generate([{id:1,points:0,opponents:[],byes:1},{id:2,points:0,opponents:[],byes:0},{id:3,points:0,opponents:[],byes:0}]); assert.notEqual(result.find(p => p.isBye)?.playerAId, 1); });
  it('evita rematches cuando hay otra pareja posible', () => { const result = service.generate([{id:1,points:9,opponents:[2],byes:0},{id:2,points:9,opponents:[1],byes:0},{id:3,points:6,opponents:[],byes:0},{id:4,points:6,opponents:[],byes:0}]); const first = result.find(p => p.playerAId === 1); assert.notEqual(first?.playerBId, 2); });
  it('prioriza puntos similares con orden determinista', () => { const result = service.generate([{id:1,points:9,opponents:[],byes:0},{id:2,points:9,opponents:[],byes:0},{id:3,points:3,opponents:[],byes:0},{id:4,points:3,opponents:[],byes:0}]); assert.deepEqual(result.map(p => [p.playerAId,p.playerBId]), [[1,2],[3,4]]); });
});
