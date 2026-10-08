import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface YugiohLeague { id:number; name:string; slug:string; description:string; format:string; season:string; status:string; scoringConfig:{winPoints:number;drawPoints:number;lossPoints:number;byePoints:number;allowDraws:boolean;validScores:string[]}; finalPodium?:{championId:number;runnerUpId?:number;thirdId?:number}; participants?:Participant[]; rounds?:Round[] }
export interface Participant { id:number; leagueId:number; playerId:number; status:string; player:{id:number;name:string;nickname:string|null} }
export interface Match { id:number; tableNumber:number; playerAId:number; playerBId:number|null; playerAScore:number|null; playerBScore:number|null; status:string; isBye:boolean; playerA:Participant; playerB:Participant|null }
export interface Round { id:number; number:number; status:string; pairingsConfirmed:boolean; matches:Match[] }
export interface Standing { position:number;participantId:number;playerId:number;name:string;nickname:string|null;played:number;wins:number;draws:number;losses:number;points:number;gamesWon:number;gamesLost:number;gameDifference:number;byes:number }

@Injectable({providedIn:'root'})
export class YugiohApiService {
  private readonly base='/api/yugioh'; constructor(private http:HttpClient){}
  leagues(){return this.http.get<YugiohLeague[]>(`${this.base}/leagues`)}
  league(id:number){return this.http.get<YugiohLeague>(`${this.base}/leagues/${id}`)}
  participants(id:number){return this.http.get<Participant[]>(`${this.base}/leagues/${id}/participants`)}
  rounds(id:number){return this.http.get<Round[]>(`${this.base}/leagues/${id}/rounds`)}
  standings(id:number){return this.http.get<Standing[]>(`${this.base}/leagues/${id}/standings`)}
  createLeague(data:unknown){return this.http.post<YugiohLeague>(`${this.base}/leagues`,data)}
  addParticipant(id:number,data:unknown){return this.http.post(`${this.base}/leagues/${id}/participants`,data)}
  updateParticipant(leagueId:number,id:number,status:string){return this.http.patch(`${this.base}/leagues/${leagueId}/participants/${id}`,{status})}
  createRound(id:number){return this.http.post<Round>(`${this.base}/leagues/${id}/rounds`,{})}
  generate(roundId:number){return this.http.post<Round>(`${this.base}/rounds/${roundId}/generate-pairings`,{})}
  replacePairings(roundId:number,pairings:{playerAId:number;playerBId:number|null}[]){return this.http.patch<Round>(`${this.base}/rounds/${roundId}/pairings`,{pairings})}
  confirm(roundId:number){return this.http.post(`${this.base}/rounds/${roundId}/confirm`,{})}
  result(matchId:number,playerAScore:number,playerBScore:number){return this.http.patch(`${this.base}/matches/${matchId}/result`,{playerAScore,playerBScore})}
  finish(id:number){return this.http.post(`${this.base}/leagues/${id}/finish`,{})}
  export(id:number){return this.http.get(`${this.base}/leagues/${id}/export`)}
}
