import { Injectable } from '@nestjs/common';
import { YugiohLeagueParticipant } from './entities/yugioh-participant.entity';
import { YugiohMatch } from './entities/yugioh-match.entity';
import { ScoringConfig, YugiohMatchStatus } from './yugioh.enums';

export interface Standing { position: number; participantId: number; playerId: number; name: string; nickname: string | null; played: number; wins: number; draws: number; losses: number; points: number; gamesWon: number; gamesLost: number; gameDifference: number; byes: number }
@Injectable()
export class StandingsService {
  calculate(participants: YugiohLeagueParticipant[], matches: YugiohMatch[], scoring: ScoringConfig): Standing[] {
    const rows = new Map<number, Standing>();
    for (const p of participants) rows.set(p.id, { position: 0, participantId: p.id, playerId: p.playerId, name: p.player?.name ?? '', nickname: p.player?.nickname ?? null, played: 0, wins: 0, draws: 0, losses: 0, points: 0, gamesWon: 0, gamesLost: 0, gameDifference: 0, byes: 0 });
    for (const match of matches.filter(m => m.status === YugiohMatchStatus.COMPLETED)) {
      const a = rows.get(match.playerAId); if (!a) continue;
      a.played++; a.gamesWon += match.playerAScore ?? 0; a.gamesLost += match.playerBScore ?? 0;
      if (match.isBye) { a.wins++; a.byes++; a.points += scoring.byePoints; continue; }
      const b = rows.get(match.playerBId!); if (!b) continue;
      b.played++; b.gamesWon += match.playerBScore ?? 0; b.gamesLost += match.playerAScore ?? 0;
      if (match.winnerId === null) { a.draws++; b.draws++; a.points += scoring.drawPoints; b.points += scoring.drawPoints; }
      else if (match.winnerId === a.participantId) { a.wins++; b.losses++; a.points += scoring.winPoints; b.points += scoring.lossPoints; }
      else { b.wins++; a.losses++; b.points += scoring.winPoints; a.points += scoring.lossPoints; }
    }
    const completed = matches.filter(m => m.status === YugiohMatchStatus.COMPLETED && !m.isBye);
    const sorted = [...rows.values()].map(row => ({ ...row, gameDifference: row.gamesWon - row.gamesLost })).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const direct = completed.filter(m => (m.playerAId === a.participantId && m.playerBId === b.participantId) || (m.playerAId === b.participantId && m.playerBId === a.participantId));
      if (direct.length === 1 && direct[0].winnerId) return direct[0].winnerId === a.participantId ? -1 : 1;
      return b.gameDifference - a.gameDifference || b.wins - a.wins || a.playerId - b.playerId;
    });
    return sorted.map((row, index) => ({ ...row, position: index + 1 }));
  }
}
