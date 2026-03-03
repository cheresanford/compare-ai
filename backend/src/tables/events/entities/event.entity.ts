import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { EventStatus } from "../../event-statuses/entities/event-status.entity";
import { User } from "../../users/entities/user.entity";

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 200 })
  title: string;

  @Column({ type: "datetime" })
  startDate: Date;

  @Column({ type: "datetime" })
  endDate: Date;

  @Column({ type: "varchar", length: 255 })
  location: string;

  @CreateDateColumn({
    type: "datetime",
    precision: 6,
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt: Date;

  @Column({ type: "int", name: "status_id" })
  statusId: number;

  @ManyToOne(() => EventStatus, (status) => status.events, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "status_id" })
  status: EventStatus;

  @Column({ type: "int", name: "user_id" })
  userId: number;

  @ManyToOne(() => User, (user) => user.events, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "int", name: "category_id", nullable: true })
  categoryId?: number | null;

  @ManyToOne(() => Category, (category) => category.events, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "category_id" })
  category?: Category | null;

  @Column({ type: "varchar", length: 255, name: "google_event_id", nullable: true })
  googleEventId?: string | null;

  @Column({ type: "datetime", name: "google_synced_at", nullable: true })
  googleSyncedAt?: Date | null;
}
