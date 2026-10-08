import { BadRequestException, ConflictException, Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateLeagueDto, CreateTeamDto, UpdateTeamDto } from './dto/football.dto';
import { FootballLeague, LeagueStatus } from './entities/football-league.entity';
import { FootballMatch, FootballMatchStatus } from './entities/football-match.entity';
import { FootballTeam } from './entities/football-team.entity';
import { ScheduleGeneratorService } from './schedule/schedule-generator.service';
import { FootballSimulationService } from './simulation/football-simulation.service';
import { StandingsService } from './standings/standings.service';

@Injectable()
export class FootballService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(FootballTeam) private readonly teams: Repository<FootballTeam>,
    @InjectRepository(FootballLeague) private readonly leagues: Repository<FootballLeague>,
    @InjectRepository(FootballMatch) private readonly matches: Repository<FootballMatch>,
    private readonly dataSource: DataSource,
    private readonly simulator: FootballSimulationService,
    private readonly scheduler: ScheduleGeneratorService,
    private readonly standings: StandingsService,
  ) {}

  async onApplicationBootstrap() {
    if (await this.teams.count()) return;
    await this.teams.save([
      ['América', 'AME', 88, 82], ['Cruz Azul', 'CAZ', 84, 85], ['Tigres', 'TIG', 86, 84], ['Monterrey', 'MTY', 85, 83],
      ['Toluca', 'TOL', 82, 78], ['Pumas', 'PUM', 79, 77], ['Chivas', 'CHI', 78, 80], ['Puebla', 'PUE', 70, 67],
    ].map(([name, abbreviation, attack, defense]) => this.teams.create({ name: String(name), abbreviation: String(abbreviation), attack: Number(attack), defense: Number(defense), overall: this.overall(Number(attack), Number(defense)) })));
  }

  findTeams() { return this.teams.find({ order: { name: 'ASC' } }); }
  async createTeam(dto: CreateTeamDto) {
    const team = this.teams.create({ ...dto, name: dto.name.trim(), abbreviation: dto.abbreviation.trim().toUpperCase(), overall: this.overall(dto.attack, dto.defense) });
    try { return await this.teams.save(team); } catch { throw new ConflictException('El nombre o abreviatura ya existe'); }
  }
  async updateTeam(id: number, dto: UpdateTeamDto) {
    const team = await this.team(id);
    Object.assign(team, dto, { name: dto.name?.trim() ?? team.name, abbreviation: dto.abbreviation?.trim().toUpperCase() ?? team.abbreviation });
    team.overall = this.overall(team.attack, team.defense);
    try { return await this.teams.save(team); } catch { throw new ConflictException('El nombre o abreviatura ya existe'); }
  }
  async deleteTeam(id: number) {
    const team = await this.team(id);
    try { await this.teams.remove(team); } catch { throw new ConflictException('El equipo pertenece a una liga o partido'); }
    return { deleted: true };
  }

  findLeagues() { return this.leagues.find({ relations: { teams: true }, order: { createdAt: 'DESC' } }); }
  async findLeague(id: number) {
    const league = await this.leagues.findOne({ where: { id }, relations: { teams: true } });
    if (!league) throw new NotFoundException('Liga no encontrada'); return league;
  }
  async createLeague(dto: CreateLeagueDto) {
    const ids = [...new Set(dto.teamIds)];
    if (ids.length !== dto.teamIds.length) throw new BadRequestException('Los equipos no pueden repetirse');
    const teams = await this.teams.createQueryBuilder('team').where('team.id IN (:...ids)', { ids }).getMany();
    if (teams.length !== ids.length) throw new BadRequestException('Uno o más equipos no existen');
    return this.leagues.save(this.leagues.create({ name: dto.name.trim(), teams }));
  }
  async generateSchedule(id: number) {
    return this.dataSource.transaction(async manager => {
      const lockedLeague = await manager.getRepository(FootballLeague).findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!lockedLeague) throw new NotFoundException('Liga no encontrada');
      const league = (await manager.getRepository(FootballLeague).findOne({ where: { id }, relations: { teams: true } }))!;
      if (league.status !== LeagueStatus.DRAFT) throw new BadRequestException('La liga ya tiene calendario');
      const pairs = this.scheduler.generate(league.teams.map(team => team.id));
      const start = Date.now() + 86400000;
      const matches = pairs.map(pair => manager.create(FootballMatch, { ...pair, leagueId: id, scheduledAt: new Date(start + (pair.round - 1) * 7 * 86400000) }));
      await manager.save(matches); league.status = LeagueStatus.SCHEDULED; await manager.save(league);
      return matches.length;
    }).then(matchesCreated => ({ matchesCreated }));
  }

  findMatches(leagueId?: number) { return this.matches.find({ where: leagueId ? { leagueId } : {}, relations: { homeTeam: true, awayTeam: true, league: true }, order: { round: 'ASC', id: 'ASC' } }); }
  async probabilities(id: number) { const match = await this.match(id); return this.simulator.calculateWinProbability(match.homeTeam, match.awayTeam); }
  async simulateMatch(id: number) {
    return this.dataSource.transaction(async manager => {
      const lockedMatch = await manager.getRepository(FootballMatch).findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!lockedMatch) throw new NotFoundException('Partido no encontrado');
      const match = (await manager.getRepository(FootballMatch).findOne({ where: { id }, relations: { homeTeam: true, awayTeam: true, league: true } }))!;
      if (match.status !== FootballMatchStatus.PENDING) throw new BadRequestException('El partido ya fue simulado');
      const result = this.simulator.simulateMatch(match.homeTeam, match.awayTeam);
      match.homeGoals = result.homeGoals; match.awayGoals = result.awayGoals; match.status = FootballMatchStatus.FINISHED; match.playedAt = new Date();
      if (match.league.status === LeagueStatus.SCHEDULED) { match.league.status = LeagueStatus.IN_PROGRESS; await manager.save(match.league); }
      await manager.save(match);
      const pending = await manager.count(FootballMatch, { where: { leagueId: match.leagueId, status: FootballMatchStatus.PENDING } });
      if (pending === 0) { match.league.status = LeagueStatus.FINISHED; await manager.save(match.league); }
      return { ...match, probabilities: result.probabilities };
    });
  }
  async simulateRound(leagueId: number, round: number) {
    const pending = await this.matches.find({ where: { leagueId, round, status: FootballMatchStatus.PENDING }, order: { id: 'ASC' } });
    if (!pending.length) throw new BadRequestException('La jornada no tiene partidos pendientes');
    const results = []; for (const match of pending) results.push(await this.simulateMatch(match.id)); return results;
  }
  async getStandings(leagueId: number) {
    const league = await this.findLeague(leagueId); const matches = await this.matches.findBy({ leagueId });
    return this.standings.calculate(league.teams, matches);
  }
  private async team(id: number) { const team = await this.teams.findOneBy({ id }); if (!team) throw new NotFoundException('Equipo no encontrado'); return team; }
  private async match(id: number) { const match = await this.matches.findOne({ where: { id }, relations: { homeTeam: true, awayTeam: true } }); if (!match) throw new NotFoundException('Partido no encontrado'); return match; }
  private overall(attack: number, defense: number) { return Math.round((attack + defense) / 2); }
}
