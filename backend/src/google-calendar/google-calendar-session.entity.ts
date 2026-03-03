import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "google_calendar_sessions" })
export class GoogleCalendarSessionEntity {
  @PrimaryColumn({ type: "int" })
  id: number;

  @Column({ type: "text" })
  accessToken: string;

  @Column({ type: "text", nullable: true })
  refreshToken?: string | null;

  @Column({ type: "datetime", nullable: true })
  expiryDate?: Date | null;

  @Column({ type: "text", nullable: true })
  scope?: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  tokenType?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  accountEmail?: string | null;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;
}
