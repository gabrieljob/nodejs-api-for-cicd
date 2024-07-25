import { Model, DataTypes, Optional } from "sequelize";
import db from "../database/mysql/db";
import { RolesEnum } from "../types/User";

export interface UserModel {
  id: number;
  name: string;
  email: string;
  password: string;
  role: RolesEnum;
}

interface UserCreationAttributes extends Optional<UserModel, "id"> {}

class User
  extends Model<UserModel, UserCreationAttributes>
  implements UserModel
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: RolesEnum;

  public createdAt!: string;
  public updatedAt!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    sequelize: db,
  }
);

export default User;
