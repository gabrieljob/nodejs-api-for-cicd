import { Sequelize } from "sequelize";
import dbConfig from "../../config/database";

const connect = () => {
  return new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
    }
  );
};

export default connect();
