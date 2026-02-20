import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtToEvents1700000000001 implements MigrationInterface {
  name = "AddCreatedAtToEvents1700000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`events\`
      ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`events\`
      DROP COLUMN \`created_at\`
    `);
  }
}
