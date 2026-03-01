import { MigrationInterface, QueryRunner } from "typeorm";

export class LimitCategoryNameLength1700000000002
  implements MigrationInterface
{
  name = "LimitCategoryNameLength1700000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`categories\`
      MODIFY \`name\` varchar(60) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`categories\`
      MODIFY \`name\` varchar(100) NOT NULL
    `);
  }
}
