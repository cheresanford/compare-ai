import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleIntegration1772497874570 implements MigrationInterface {
    name = 'AddGoogleIntegration1772497874570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_category\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_status\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_categories_name\` ON \`categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_event_statuses_name\` ON \`event_statuses\``);
        await queryRunner.query(`DROP INDEX \`IDX_users_email\` ON \`users\``);
        await queryRunner.query(`CREATE TABLE \`google_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`access_token\` text NOT NULL, \`refresh_token\` text NULL, \`scope\` text NULL, \`token_type\` varchar(50) NULL, \`expiry_date\` bigint NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`google_event_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`google_synced_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD UNIQUE INDEX \`IDX_8b0be371d28245da6e4f4b6187\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`event_statuses\` ADD UNIQUE INDEX \`IDX_fa3f6769af9156cd3969e861be\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_723091d08c3c5415a1999597464\` FOREIGN KEY (\`status_id\`) REFERENCES \`event_statuses\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_09f256fb7f9a05f0ed9927f406b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_643188b30e049632f80367be4e1\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_643188b30e049632f80367be4e1\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_09f256fb7f9a05f0ed9927f406b\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_723091d08c3c5415a1999597464\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`event_statuses\` DROP INDEX \`IDX_fa3f6769af9156cd3969e861be\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP INDEX \`IDX_8b0be371d28245da6e4f4b6187\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`google_synced_at\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`google_event_id\``);
        await queryRunner.query(`DROP TABLE \`google_tokens\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_users_email\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_event_statuses_name\` ON \`event_statuses\` (\`name\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_categories_name\` ON \`categories\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_events_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_events_status\` FOREIGN KEY (\`status_id\`) REFERENCES \`event_statuses\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_events_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
