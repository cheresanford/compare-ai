import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "../../events/entities/event.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];
}
