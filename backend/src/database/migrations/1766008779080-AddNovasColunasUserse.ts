import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNovasColunasUserse1766008779080 implements MigrationInterface {
    name = 'AddNovasColunasUserse1766008779080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`is_active\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`nickname\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_active\``);
    }

}
