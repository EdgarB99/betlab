import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'; import { Event } from '../events/event.entity'; import { User } from '../users/user.entity';
export enum BetSelection { HOME='HOME', DRAW='DRAW', AWAY='AWAY' } export enum BetStatus { PENDING='PENDING', WON='WON', LOST='LOST', CANCELLED='CANCELLED' }
@Entity('bets') export class Bet {
  @PrimaryGeneratedColumn() id:number;
  @Column() userId:number; @ManyToOne(()=>User,(user)=>user.bets,{onDelete:'CASCADE'}) user:User;
  @Column() eventId:number; @ManyToOne(()=>Event,(event)=>event.bets,{onDelete:'RESTRICT'}) event:Event;
  @Column({type:'enum',enum:BetSelection}) selection:BetSelection;
  @Column('decimal',{precision:6,scale:2}) odds:string; @Column('decimal',{precision:12,scale:2}) amount:string; @Column('decimal',{precision:12,scale:2}) potentialPayout:string;
  @Column({type:'enum',enum:BetStatus,default:BetStatus.PENDING}) status:BetStatus; @CreateDateColumn() createdAt:Date;
}

