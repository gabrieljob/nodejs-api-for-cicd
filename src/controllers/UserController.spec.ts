import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import User from "../entities/User";
import serverConfig from "../config/server";
import { UserController } from "../controllers/UserController";
import dbConfig from "../config/database";
import { Sequelize } from "sequelize";

describe("UserController", () => {
  let sequelize: Sequelize;
  let userRepository: UserRepository;
  let userController: UserController;
  let req: Request;
  let res: Response;

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

    userController = new UserController(new UserRepository());
  });

  beforeEach(() => {
    userRepository = new UserRepository();
    userController = new UserController(userRepository);
    req = {} as Request;
    res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("getAll", () => {
    it("should return all users", async () => {
      const users = [new User(), new User()];
      userRepository.getAll = jest.fn().mockResolvedValue(users);

      await userController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith(users);
    });

    it("should return 500 if an error occurs", async () => {
      const error = new Error("Internal Server Error");
      userRepository.getAll = jest.fn().mockRejectedValue(error);

      await userController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const form = {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
        role: "USER",
      };
      const createdUser = {
        id: 1,
        name: "any_name",
        email: "any_email@mail.com",
        password: "hashed_password",
        role: "USER",
      };

      req.body = form;
      bcrypt.hash = jest.fn().mockReturnValue("hashed_password");
      userRepository.createUser = jest.fn().mockResolvedValue(createdUser);

      await userController.createUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("any_password", 10);
      expect(userRepository.createUser).toHaveBeenCalledWith(form);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it("should return 500 if an error occurs", async () => {
      const user = new User();
      const error = new Error("Internal Server Error");
      req.body = user;
      userRepository.createUser = jest.fn().mockRejectedValue(error);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const id = 1;
      const user = new User();
      const updatedUser = new User();
      req.params = { id: id.toString() };
      req.body = user;
      userRepository.updateUser = jest.fn().mockResolvedValue(updatedUser);

      await userController.updateUser(req, res);

      expect(userRepository.updateUser).toHaveBeenCalledWith(id, user);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it("should return 500 if an error occurs", async () => {
      const id = 1;
      const user = new User();
      const error = new Error("Internal Server Error");
      req.params = { id: id.toString() };
      req.body = user;
      userRepository.updateUser = jest.fn().mockRejectedValue(error);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      const id = 1;
      req.params = { id: id.toString() };
      userRepository.deleteUser = jest.fn().mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(userRepository.deleteUser).toHaveBeenCalledWith(id);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("should return 500 if an error occurs", async () => {
      const id = 1;
      const error = new Error("Internal Server Error");
      req.params = { id: id.toString() };
      userRepository.deleteUser = jest.fn().mockRejectedValue(error);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("authenticate", () => {
    it("should authenticate a user and return a token", async () => {
      const email = "mail@mail.com";
      const password = "password";

      const user = {
        id: 1,
        password: "hashedPassword",
      };

      const token = "token";

      req.body = { email, password };

      User.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockReturnValue("hashedPassword");
      jwt.sign = jest.fn().mockReturnValue(token);

      const response = await userController.authenticate(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id },
        serverConfig.JWT_SECRET
      );
      expect(res.json).toHaveBeenCalledWith({ token });
      expect(response).toBe(res);
    });

    it("should return 401 if the user is not found", async () => {
      const email = "test@example.com";
      const password = "password";
      req.body = { email, password };
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await userController.authenticate(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
      expect(response).toBe(res);
    });

    it("should return 401 if the password is incorrect", async () => {
      const email = "mail@mail.com";
      const password = "password";

      const user = {
        id: 1,
        password: "hashedPassword",
      };

      req.body = { email, password };

      User.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockReturnValue(false);

      const response = await userController.authenticate(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Password incorrect" });
      expect(response).toBe(res);
    });

    it("should return 500 if an error occurs", async () => {
      const email = "test@example.com";
      const password = "password";
      const error = new Error("Internal Server Error");
      req.body = { email, password };
      User.findOne = jest.fn().mockRejectedValue(error);

      const response = await userController.authenticate(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error authenticating User",
      });
      expect(response).toBe(res);
    });
  });
});
