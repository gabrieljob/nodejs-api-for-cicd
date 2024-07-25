import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";
import { Roles } from "../types/User";
import serverConfig from "../config/server";
import checkJwtTokenExistence from "./checkJwtTokenExistence";
import dbConfig from "../config/database";
import { Sequelize } from "sequelize";
import User from "../entities/User";

jest.mock("jsonwebtoken");
jest.mock("../repositories/UserRepository");

interface CustomRequest extends Request {
  token?: any;
  userRole?: Roles;
}

describe("checkJwtTokenExistence middleware", () => {
  let sequelize: Sequelize;
  let userRepository: UserRepository;
  let req: CustomRequest;
  let res: Response;
  let next: NextFunction;

  beforeAll(async () => {
    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
      }
    );

    await User.sync({ force: true });
  });

  beforeEach(() => {
    userRepository = new UserRepository();
    req = {} as CustomRequest;
    req.header = jest.fn();
    res = {} as Response;
    next = jest.fn() as NextFunction;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is not provided", async () => {
    await checkJwtTokenExistence(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Token not provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if user is not found", async () => {
    const token = "Bearer valid-token";
    jwt.verify = jest.fn().mockReturnValue({ id: 1 });
    req.header = jest.fn().mockReturnValue(token);

    const userRepository = new UserRepository();
    userRepository.getById = jest.fn().mockResolvedValue(null);

    await checkJwtTokenExistence(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      token.split(" ")[1],
      serverConfig.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "User not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", async () => {
    const token = "invalid-token";
    req.header = jest.fn().mockReturnValue(token);
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await checkJwtTokenExistence(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      token.split(" ")[1],
      serverConfig.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
