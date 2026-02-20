import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "../../events/entities/event.entity";

@Entity({ name: "event_statuses" })
export class EventStatus {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 60, unique: true })
  name: string;

  @OneToMany(() => Event, (event) => event.status)
  events: Event[];
}
