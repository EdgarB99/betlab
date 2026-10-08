import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { YugiohMatch } from './entities/yugioh-match.entity';
import { YugiohLeagueParticipant } from './entities/yugioh-participant.entity';
import { StandingsService } from './standings.service';
import { DEFAULT_SCORING, YugiohMatchStatus } from './yugioh.enums';

const participant = (id:number,name:string) => ({ id, playerId:id, player:{name,nickname:null} }) as YugiohLeagueParticipant;
const match = (a:number,b:number|null,sa:number,sb:number,isBye=false) => ({ playerAId:a,playerBId:b,playerAScore:sa,playerBScore:sb,isBye,status:YugiohMatchStatus.COMPLETED,winnerId:isBye||sa>sb?a:sa<sb?b:null }) as YugiohMatch;
describe('StandingsService', () => {
  it('calcula puntos, BYE, marcadores y desempates', () => { const rows = new StandingsService().calculate([participant(1,'A'),participant(2,'B'),participant(3,'C')],[match(1,2,2,1),match(3,null,2,0,true)],DEFAULT_SCORING); assert.equal(rows[0].points,3); assert.equal(rows.find(r=>r.participantId===3)?.byes,1); assert.equal(rows.find(r=>r.participantId===1)?.gameDifference,1); assert.equal(rows.find(r=>r.participantId===2)?.losses,1); });
  it('recalcula desde los resultados corregidos sin contadores persistidos', () => { const calc=new StandingsService(); const players=[participant(1,'A'),participant(2,'B')]; assert.equal(calc.calculate(players,[match(1,2,2,0)],DEFAULT_SCORING)[0].participantId,1); assert.equal(calc.calculate(players,[match(1,2,0,2)],DEFAULT_SCORING)[0].participantId,2); });
});
