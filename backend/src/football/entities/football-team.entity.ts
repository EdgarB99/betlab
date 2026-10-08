import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('football_teams')
@Check(`"attack" BETWEEN 1 AND 100`)
@Check(`"defense" BETWEEN 1 AND 100`)
export class FootballTeam {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, length: 80 }) name: string;
  @Column({ unique: true, length: 5 }) abbreviation: string;
  @Column({ type: 'smallint' }) attack: number;
  @Column({ type: 'smallint' }) defense: number;
  @Column({ type: 'smallint' }) overall: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
