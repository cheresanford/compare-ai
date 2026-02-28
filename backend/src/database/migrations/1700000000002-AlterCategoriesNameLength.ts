import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterCategoriesNameLength1700000000002 implements MigrationInterface {
  name = "AlterCategoriesNameLength1700000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`categories\`
      MODIFY COLUMN \`name\` varchar(60) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`categories\`
      MODIFY COLUMN \`name\` varchar(100) NOT NULL
    `);
  }
}
