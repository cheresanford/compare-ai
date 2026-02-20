import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventPlanningSchema1700000000000 implements MigrationInterface {
  name = "CreateEventPlanningSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(150) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        UNIQUE INDEX \`IDX_categories_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`event_statuses\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(60) NOT NULL,
        UNIQUE INDEX \`IDX_event_statuses_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      INSERT INTO \`event_statuses\` (\`name\`) VALUES
      ('agendado'),
      ('cancelado')
    `);

    await queryRunner.query(`
      CREATE TABLE \`events\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(200) NOT NULL,
        \`startDate\` datetime NOT NULL,
        \`endDate\` datetime NOT NULL,
        \`location\` varchar(255) NOT NULL,
        \`status_id\` int NOT NULL,
        \`user_id\` int NOT NULL,
        \`category_id\` int NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`events\`
      ADD CONSTRAINT \`FK_events_user\`
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`events\`
      ADD CONSTRAINT \`FK_events_category\`
      FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`)
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`events\`
      ADD CONSTRAINT \`FK_events_status\`
      FOREIGN KEY (\`status_id\`) REFERENCES \`event_statuses\`(\`id\`)
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      INSERT INTO \`categories\` (\`name\`) VALUES
      ('Workshop'),
      ('Sprint Planning'),
      ('Treinamento Interno')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_status\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_user\``,
    );
    await queryRunner.query("DROP TABLE `events`");
    await queryRunner.query("DROP TABLE `event_statuses`");
    await queryRunner.query("DROP TABLE `categories`");
    await queryRunner.query("DROP TABLE `users`");
  }
}
