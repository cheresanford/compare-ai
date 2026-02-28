import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventosTable1772299751205 implements MigrationInterface {
    name = 'CreateEventosTable1772299751205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`evento\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`dataInicio\` datetime NOT NULL, \`dataTermino\` datetime NOT NULL, \`status\` tinyint NOT NULL, \`organizadorEmail\` varchar(255) NOT NULL, \`categoria\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`evento\``);
    }

}
