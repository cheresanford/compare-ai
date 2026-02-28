import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTituloMaxLength1772300161662 implements MigrationInterface {
    name = 'ChangeTituloMaxLength1772300161662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`evento\` DROP COLUMN \`titulo\``);
        await queryRunner.query(`ALTER TABLE \`evento\` ADD \`titulo\` varchar(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`evento\` DROP COLUMN \`titulo\``);
        await queryRunner.query(`ALTER TABLE \`evento\` ADD \`titulo\` varchar(255) NOT NULL`);
    }

}
