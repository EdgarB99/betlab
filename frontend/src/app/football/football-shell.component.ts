import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FootballLeague, FootballMatch, FootballTeam, MatchProbabilities, StandingRow } from '../models';
import { FootballApiService } from './football-api.service';

type Tab = 'teams' | 'leagues' | 'matches' | 'standings';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: '../../simulator.css',
  template: `
    <section class="sim-hero">
      <div><p class="eyebrow">BETLAB LABORATORIO</p><h1>Football<br><em>Simulator.</em></h1><p>Construye equipos, crea una liga y deja que ataque, defensa y localía decidan cada historia.</p></div>
      <div class="sim-summary"><div><strong>{{teams.length}}</strong><small>EQUIPOS</small></div><div><strong>{{leagues.length}}</strong><small>LIGAS</small></div><div><strong>{{finished}}</strong><small>JUGADOS</small></div></div>
    </section>
    <section class="content simulator">
      <nav class="sim-tabs">
        <button [class.active]="tab==='teams'" (click)="tab='teams'">Equipos</button>
        <button [class.active]="tab==='leagues'" (click)="tab='leagues'">Ligas</button>
        <button [class.active]="tab==='matches'" (click)="tab='matches'">Partidos</button>
        <button [class.active]="tab==='standings'" (click)="tab='standings'">Tabla</button>
      </nav>
      @if(message){<p class="notice" [class.error]="failed">{{message}}</p>}

      @if(tab==='teams'){
        <div class="sim-layout"><section><div class="section-title"><div><p class="eyebrow">PLANTEL</p><h2>Equipos</h2></div></div>
          <div class="team-grid">@for(team of teams;track team.id){<article class="team-card" [style.--team-primary]="teamColors(team)[0]" [style.--team-secondary]="teamColors(team)[1]"><div class="card-glow"></div><header><div class="team-flag" aria-hidden="true"><span>{{team.abbreviation}}</span></div><button class="icon-button" title="Eliminar equipo" aria-label="Eliminar equipo" (click)="removeTeam(team)">×</button></header><div class="team-copy"><p>{{team.abbreviation}} · MÉXICO</p><h3>{{team.name}}</h3></div><div class="overall"><strong>{{team.overall}}</strong><span>VALORACIÓN</span></div><div class="stat-row"><div><span>ATA</span><strong>{{team.attack}}</strong></div><div><span>DEF</span><strong>{{team.defense}}</strong></div><div><span>FORMA</span><strong>{{formLabel(team)}}</strong></div></div><div class="meters"><label><span>Ataque</span><b>{{team.attack}}</b><i><span [style.width.%]="team.attack"></span></i></label><label><span>Defensa</span><b>{{team.defense}}</b><i><span [style.width.%]="team.defense"></span></i></label></div></article>}</div>
        </section><aside class="sim-panel"><p class="eyebrow">NUEVO EQUIPO</p><h2>Crear equipo</h2><form (ngSubmit)="addTeam()"><label>Nombre<input name="name" [(ngModel)]="teamForm.name" required minlength="2" placeholder="Ej. León"></label><label>Abreviatura<input name="abbr" [(ngModel)]="teamForm.abbreviation" required minlength="2" maxlength="5" placeholder="LEO"></label><div class="form-pair"><label>Ataque<input name="attack" [(ngModel)]="teamForm.attack" type="number" min="1" max="100"></label><label>Defensa<input name="defense" [(ngModel)]="teamForm.defense" type="number" min="1" max="100"></label></div><button class="primary" [disabled]="busy">Agregar equipo</button></form></aside></div>
      }

      @if(tab==='leagues'){
        <div class="sim-layout"><section><div class="section-title"><div><p class="eyebrow">COMPETICIONES</p><h2>Mis ligas</h2></div></div><div class="league-list">@for(league of leagues;track league.id){<article><div><span class="status">{{statusLabel(league.status)}}</span><h3>{{league.name}}</h3><p class="muted">{{league.teams.length}} equipos · Todos contra todos</p></div><div class="league-actions">@if(league.status==='DRAFT'){<button class="primary" (click)="makeSchedule(league)">Generar calendario</button>}@else{<button class="secondary" (click)="selectLeague(league);tab='matches'">Ver jornadas</button>}</div></article>}@empty{<div class="empty">Crea tu primera liga con el formulario.</div>}</div></section>
          <aside class="sim-panel"><p class="eyebrow">NUEVA COMPETICIÓN</p><h2>Crear liga</h2><form (ngSubmit)="addLeague()"><label>Nombre<input name="leagueName" [(ngModel)]="leagueName" required placeholder="Liga BetLab"></label><fieldset><legend>Selecciona al menos 2 equipos</legend>@for(team of teams;track team.id){<label class="check"><input type="checkbox" [checked]="selectedTeamIds.has(team.id)" (change)="toggleTeam(team.id)"><span class="mini-badge">{{team.abbreviation}}</span>{{team.name}}</label>}</fieldset><button class="primary" [disabled]="busy || selectedTeamIds.size<2">Crear liga</button></form></aside></div>
      }

      @if(tab==='matches'){
        <div class="section-title"><div><p class="eyebrow">CALENDARIO</p><h2>Partidos</h2></div><select class="sim-select" [ngModel]="activeLeague?.id" (ngModelChange)="changeLeague($event)">@for(league of scheduledLeagues;track league.id){<option [ngValue]="league.id">{{league.name}}</option>}</select></div>
        @if(!activeLeague){<div class="empty">Genera el calendario de una liga para ver sus jornadas.</div>}
        @for(round of rounds;track round){<section class="round"><header><div><span>JORNADA</span><strong>{{round}}</strong></div>@if(roundPending(round)){<button class="secondary" [disabled]="busy" (click)="playRound(round)">Simular jornada</button>}</header><div class="fixtures">@for(match of roundMatches(round);track match.id){<article><div class="fixture-team"><span class="mini-badge">{{match.homeTeam.abbreviation}}</span><b>{{match.homeTeam.name}}</b></div><div class="score" [class.pending]="match.status==='PENDING'">@if(match.status==='FINISHED'){<strong>{{match.homeGoals}}</strong><span>—</span><strong>{{match.awayGoals}}</strong>}@else{<button (click)="showProbabilities(match)">VS</button>}</div><div class="fixture-team away"><b>{{match.awayTeam.name}}</b><span class="mini-badge">{{match.awayTeam.abbreviation}}</span></div>@if(match.status==='PENDING'){<button class="play" [disabled]="busy" (click)="playMatch(match)">Simular</button>}</article>}</div></section>}
      }

      @if(tab==='standings'){
        <div class="section-title"><div><p class="eyebrow">CLASIFICACIÓN</p><h2>Tabla de posiciones</h2></div><select class="sim-select" [ngModel]="activeLeague?.id" (ngModelChange)="changeLeague($event)">@for(league of scheduledLeagues;track league.id){<option [ngValue]="league.id">{{league.name}}</option>}</select></div>
        @if(activeLeague){<div class="table-wrap"><table><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr></thead><tbody>@for(row of standings;track row.team.id;let pos=$index){<tr><td class="position">{{pos+1}}</td><td><span class="mini-badge">{{row.team.abbreviation}}</span><b>{{row.team.name}}</b></td><td>{{row.played}}</td><td>{{row.won}}</td><td>{{row.drawn}}</td><td>{{row.lost}}</td><td>{{row.goalsFor}}</td><td>{{row.goalsAgainst}}</td><td>{{signed(row.goalDifference)}}</td><td class="points">{{row.points}}</td></tr>}</tbody></table></div>}@else{<div class="empty">Aún no hay una liga con calendario.</div>}
      }
    </section>
    @if(probabilityMatch && probability){<div class="backdrop" (click)="closeProbability()"><article class="modal probability-modal" (click)="$event.stopPropagation()"><button class="close" (click)="closeProbability()">×</button><p class="eyebrow">PRONÓSTICO DEL MOTOR</p><h2>{{probabilityMatch.homeTeam.name}} vs {{probabilityMatch.awayTeam.name}}</h2><p class="muted">Basado en ataque, defensa y ventaja de local.</p><div class="probabilities"><div><strong>{{percent(probability.home)}}</strong><span>LOCAL</span></div><div><strong>{{percent(probability.draw)}}</strong><span>EMPATE</span></div><div><strong>{{percent(probability.away)}}</strong><span>VISITANTE</span></div></div><button class="primary" [disabled]="busy" (click)="playMatch(probabilityMatch)">Simular partido</button></article></div>}
  `,
})
export class FootballShellComponent implements OnInit {
  tab: Tab = 'teams'; teams: FootballTeam[] = []; leagues: FootballLeague[] = []; matches: FootballMatch[] = []; standings: StandingRow[] = [];
  activeLeague: FootballLeague | null = null; probabilityMatch: FootballMatch | null = null; probability: MatchProbabilities | null = null;
  teamForm = { name: '', abbreviation: '', attack: 75, defense: 75 }; leagueName = ''; selectedTeamIds = new Set<number>(); busy = false; message = ''; failed = false;
  constructor(private readonly api: FootballApiService) {}
  ngOnInit() { this.refresh(); }
  get scheduledLeagues() { return this.leagues.filter(l => l.status !== 'DRAFT'); }
  get rounds() { return [...new Set(this.matches.map(m => m.round))]; }
  get finished() { return this.matches.filter(m => m.status === 'FINISHED').length; }
  refresh() { forkJoin({ teams: this.api.teams(), leagues: this.api.leagues() }).subscribe({ next: ({ teams, leagues }) => { this.teams = teams; this.leagues = leagues; const selected = this.activeLeague && leagues.find(l => l.id === this.activeLeague!.id); if (selected) this.selectLeague(selected); else if (!this.activeLeague && this.scheduledLeagues[0]) this.selectLeague(this.scheduledLeagues[0]); }, error: e => this.alert(e) }); }
  addTeam() { this.run(this.api.createTeam(this.teamForm), () => { this.teamForm = { name: '', abbreviation: '', attack: 75, defense: 75 }; this.refresh(); }, 'Equipo creado'); }
  removeTeam(team: FootballTeam) { if (!confirm(`¿Eliminar ${team.name}?`)) return; this.run(this.api.deleteTeam(team.id), () => this.refresh(), 'Equipo eliminado'); }
  toggleTeam(id: number) { this.selectedTeamIds.has(id) ? this.selectedTeamIds.delete(id) : this.selectedTeamIds.add(id); }
  addLeague() { this.run(this.api.createLeague({ name: this.leagueName, teamIds: [...this.selectedTeamIds] }), () => { this.leagueName = ''; this.selectedTeamIds.clear(); this.refresh(); }, 'Liga creada'); }
  makeSchedule(league: FootballLeague) { this.run(this.api.schedule(league.id), () => { this.activeLeague = league; this.refresh(); }, 'Calendario generado'); }
  selectLeague(league: FootballLeague) { this.activeLeague = league; forkJoin({ matches: this.api.matches(league.id), standings: this.api.standings(league.id) }).subscribe({ next: data => { this.matches = data.matches; this.standings = data.standings; }, error: e => this.alert(e) }); }
  changeLeague(id: number) { const league = this.leagues.find(l => l.id === Number(id)); if (league) this.selectLeague(league); }
  roundMatches(round: number) { return this.matches.filter(m => m.round === round); }
  roundPending(round: number) { return this.roundMatches(round).some(m => m.status === 'PENDING'); }
  playMatch(match: FootballMatch) { this.run(this.api.simulateMatch(match.id), () => { this.closeProbability(); this.reloadLeague(); }, 'Partido simulado'); }
  playRound(round: number) { if (!this.activeLeague) return; this.run(this.api.simulateRound(this.activeLeague.id, round), () => this.reloadLeague(), `Jornada ${round} simulada`); }
  showProbabilities(match: FootballMatch) { this.probabilityMatch = match; this.api.probabilities(match.id).subscribe({ next: p => this.probability = p, error: e => this.alert(e) }); }
  closeProbability() { this.probability = null; this.probabilityMatch = null; }
  reloadLeague() { if (!this.activeLeague) return; const league = this.activeLeague; this.api.leagues().subscribe(leagues => { this.leagues = leagues; this.selectLeague(leagues.find(l => l.id === league.id) ?? league); }); }
  percent(value: number) { return `${Math.round(value * 100)}%`; }
  signed(value: number) { return value > 0 ? `+${value}` : String(value); }
  teamColors(team: FootballTeam): [string, string] { const palettes: [string, string][] = [['#f4c542','#173b8f'],['#e23b42','#ffffff'],['#2675d8','#ffffff'],['#123c87','#f5f5f5'],['#d12b36','#f0c34a'],['#142b66','#d6af56'],['#df232f','#162b63'],['#2469b3','#f3f5ff']]; return palettes[(team.id - 1) % palettes.length]; }
  formLabel(team: FootballTeam) { return team.overall >= 84 ? 'A' : team.overall >= 78 ? 'B' : 'C'; }
  statusLabel(status: string) { return ({ DRAFT: 'BORRADOR', SCHEDULED: 'PROGRAMADA', IN_PROGRESS: 'EN CURSO', FINISHED: 'FINALIZADA' } as Record<string, string>)[status] ?? status; }
  private run(request: { subscribe: Function }, done: () => void, success: string) { this.busy = true; this.message = ''; request.subscribe({ next: () => { this.busy = false; this.failed = false; this.message = success; done(); }, error: (e: unknown) => { this.busy = false; this.alert(e); } }); }
  private alert(error: any) { this.failed = true; this.message = error?.error?.message ?? 'No se pudo completar la operación'; }
}
