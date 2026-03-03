import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventStatus } from "./event-status.enum";
import { CategoryEntity } from "../categories/category.entity";

@Entity({ name: "events" })
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  title: string;

  @Column({ type: "datetime" })
  startDate: Date;

  @Column({ type: "datetime" })
  endDate: Date;

  @Column({ type: "varchar", length: 255 })
  location: string;

  @Column({ type: "varchar", length: 255 })
  organizerEmail: string;

  @Column({ type: "enum", enum: EventStatus, default: EventStatus.Scheduled })
  status: EventStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  googleCalendarEventId?: string | null;

  @Column({ type: "int", nullable: true })
  categoryId?: number | null;

  @ManyToOne(() => CategoryEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "categoryId" })
  category?: CategoryEntity | null;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;
}
