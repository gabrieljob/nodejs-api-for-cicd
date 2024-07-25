import { Dialect } from "sequelize/types";

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
}

const dbConfig: DatabaseConfig = {
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  host: process.env.DB_HOST as string,
  dialect: process.env.DB_DIALECT as Dialect,
};

export default dbConfig;
