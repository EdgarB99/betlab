export interface User {id:number;name:string;email:string;balance:string;createdAt:string} export interface Event {id:number;homeTeam:string;awayTeam:string;league:string;startDate:string;status:string;homeOdds:string;drawOdds:string;awayOdds:string} export type Selection='HOME'|'DRAW'|'AWAY'; export interface Bet {id:number;selection:Selection;odds:string;amount:string;potentialPayout:string;status:string;createdAt:string;event:Event}
export interface FootballTeam {id:number;name:string;abbreviation:string;attack:number;defense:number;overall:number}
export interface FootballLeague {id:number;name:string;format:string;status:string;teams:FootballTeam[]}
export interface MatchProbabilities {home:number;draw:number;away:number}
export interface FootballMatch {id:number;leagueId:number;round:number;homeTeam:FootballTeam;awayTeam:FootballTeam;homeGoals:number|null;awayGoals:number|null;status:string;scheduledAt:string|null;league:FootballLeague}
export interface StandingRow {team:FootballTeam;played:number;won:number;drawn:number;lost:number;goalsFor:number;goalsAgainst:number;goalDifference:number;points:number}
