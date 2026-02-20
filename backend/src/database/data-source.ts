import "reflect-metadata";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST ?? "localhost",
  port: Number.parseInt(process.env.DB_PORT ?? "3306", 10),
  username: process.env.DB_USER ?? "root",
  password: process.env.DB_PASS ?? "",
  database: process.env.DB_NAME ?? "tcc",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
});

export default AppDataSource;
