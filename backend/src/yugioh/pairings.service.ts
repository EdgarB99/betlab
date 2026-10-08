import { BadRequestException, Injectable } from '@nestjs/common';

export interface PairingCandidate { id: number; points: number; opponents: number[]; byes: number }
export interface ProposedPairing { playerAId: number; playerBId: number | null; isBye: boolean }

@Injectable()
export class PairingsService {
  generate(input: PairingCandidate[]): ProposedPairing[] {
    if (!input.length) throw new BadRequestException('No hay participantes activos');
    const pool = [...input].sort((a, b) => b.points - a.points || a.byes - b.byes || a.id - b.id);
    const result: ProposedPairing[] = [];
    if (pool.length % 2) {
      const bye = [...pool].sort((a, b) => a.byes - b.byes || a.points - b.points || a.id - b.id)[0];
      pool.splice(pool.findIndex(p => p.id === bye.id), 1);
      result.push({ playerAId: bye.id, playerBId: null, isBye: true });
    }
    while (pool.length) {
      const first = pool.shift()!;
      let index = pool.findIndex(candidate => !first.opponents.includes(candidate.id));
      if (index < 0) index = 0; // Relajación determinista: permite rematch antes que un pareo inválido.
      const second = pool.splice(index, 1)[0];
      result.push({ playerAId: first.id, playerBId: second.id, isBye: false });
    }
    return result.sort((a, b) => Number(a.isBye) - Number(b.isBye));
  }
}
