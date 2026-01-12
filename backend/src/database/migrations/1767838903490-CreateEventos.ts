import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventos1767838903490 implements MigrationInterface {
    name = 'CreateEventos1767838903490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`eventos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nome_evento\` varchar(200) NOT NULL, \`data_evento\` datetime NOT NULL, \`local_evento\` varchar(300) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`eventos\``);
    }

}
