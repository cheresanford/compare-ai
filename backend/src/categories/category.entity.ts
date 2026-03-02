import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventEntity } from "../events/event.entity";

@Entity({ name: "event_categories" })
@Index(["name"], { unique: true })
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 60 })
  name: string;

  @OneToMany(() => EventEntity, (event) => event.category)
  events?: EventEntity[];

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;
}
