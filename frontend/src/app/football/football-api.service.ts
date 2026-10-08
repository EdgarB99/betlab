import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FootballLeague, FootballMatch, FootballTeam, MatchProbabilities, StandingRow } from '../models';

@Injectable({ providedIn: 'root' })
export class FootballApiService {
  private readonly base = '/api/football';
  constructor(private readonly http: HttpClient) {}
  teams() { return this.http.get<FootballTeam[]>(`${this.base}/teams`); }
  createTeam(team: { name: string; abbreviation: string; attack: number; defense: number }) { return this.http.post<FootballTeam>(`${this.base}/teams`, team); }
  deleteTeam(id: number) { return this.http.delete(`${this.base}/teams/${id}`); }
  leagues() { return this.http.get<FootballLeague[]>(`${this.base}/leagues`); }
  createLeague(data: { name: string; teamIds: number[] }) { return this.http.post<FootballLeague>(`${this.base}/leagues`, data); }
  schedule(id: number) { return this.http.post(`${this.base}/leagues/${id}/schedule`, {}); }
  matches(leagueId: number) { return this.http.get<FootballMatch[]>(`${this.base}/matches`, { params: new HttpParams().set('leagueId', leagueId) }); }
  probabilities(id: number) { return this.http.get<MatchProbabilities>(`${this.base}/matches/${id}/probabilities`); }
  simulateMatch(id: number) { return this.http.post<FootballMatch>(`${this.base}/matches/${id}/simulate`, {}); }
  simulateRound(leagueId: number, round: number) { return this.http.post<FootballMatch[]>(`${this.base}/leagues/${leagueId}/rounds/${round}/simulate`, {}); }
  standings(leagueId: number) { return this.http.get<StandingRow[]>(`${this.base}/leagues/${leagueId}/standings`); }
}
