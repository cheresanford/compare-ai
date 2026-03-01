import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventStatus } from "./event-status.enum";
import { CategoryEntity } from "src/categories/entities/category.entity";

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

  @ManyToOne(() => CategoryEntity, (category) => category.events, {
    eager: true,
  })
  category: CategoryEntity;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;
}
