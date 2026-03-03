import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "google_tokens" })
export class GoogleToken {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "text", name: "access_token" })
  accessToken: string;

  @Column({ type: "text", name: "refresh_token", nullable: true })
  refreshToken?: string | null;

  @Column({ type: "text", nullable: true })
  scope?: string | null;

  @Column({ type: "varchar", length: 50, name: "token_type", nullable: true })
  tokenType?: string | null;

  @Column({ type: "bigint", name: "expiry_date", nullable: true })
  expiryDate?: string | null;

  @CreateDateColumn({
    type: "datetime",
    precision: 6,
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "datetime",
    precision: 6,
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  updatedAt: Date;
}
