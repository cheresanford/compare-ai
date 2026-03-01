import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EventStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'events' })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ length: 160 })
  location: string;

  @Column({ length: 200 })
  organizerEmail: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Column({ length: 100, nullable: true })
  category?: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
