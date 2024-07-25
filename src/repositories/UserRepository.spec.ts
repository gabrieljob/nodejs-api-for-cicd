import { Sequelize } from "sequelize";
import dbConfig from "../config/database";
import User from "../entities/User";
import { UserRepository } from "./UserRepository";
import { Request, Response } from "express";
import { Roles } from "../types/User";

describe("UserRepository", () => {
  let sequelize: Sequelize;
  let userRepository: UserRepository;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

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
    it("should return an array of User", async () => {
      const users = [new User(), new User()];
      userRepository.getAll = jest.fn().mockResolvedValue(users);
      const result = await userRepository.getAll();

      expect(result).toBeInstanceOf(Array);
    });

    it("should throw an error if an exception occurs", async () => {
      jest.spyOn(User, "findAll").mockRejectedValueOnce(new Error());
      await expect(userRepository.getAll()).rejects.toThrow(Error);
    });
  });

  describe("createUser", () => {
    it("should create a new user and return the User", async () => {
      const user = new User();
      user.name = "any_name";
      user.email = "any_email@mail.com";
      user.password = "any_password";
      user.role = Roles.USER;

      const result = await userRepository.createUser(user);
      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
      expect(result.password).toBe(user.password);
      expect(result.role).toBe(user.role);
    });

    it("should throw an error if an exception occurs", async () => {
      jest.spyOn(User, "create").mockRejectedValueOnce(new Error());
      const user = new User();
      user.name = "any_name";
      user.email = "any_email@mail.com";
      user.password = "any_password";
      user.role = Roles.USER;
      await expect(userRepository.createUser(user)).rejects.toThrow(Error);
    });
  });

  describe("updateUser", () => {
    it("should update the user and return the updated UserModel", async () => {
      const id = 1;
      const user = new User();
      user.name = "any_name";
      user.email = "any_email@mail.com";
      user.password = "any_password";
      user.role = Roles.USER;

      jest.spyOn(User, "update").mockResolvedValueOnce([1]);
      jest.spyOn(User, "findOne").mockResolvedValueOnce(user);

      const result = await userRepository.updateUser(id, user);
      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
      expect(result.password).toBe(user.password);
      expect(result.role).toBe(user.role);
    });

    it("should return the original user if no user is found with the given id", async () => {
      const id = 1;
      const user = new User();
      user.id = 1;
      user.name = "any_name";
      user.email = "any_email@mail.com";
      user.password = "any_password";
      user.role = Roles.USER;

      jest.spyOn(User, "update").mockResolvedValueOnce([0]);

      const result = await userRepository.updateUser(id, user);
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(user.id);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
      expect(result.password).toBe(user.password);
      expect(result.role).toBe(user.role);
    });

    it("should throw an error if an exception occurs", async () => {
      jest.spyOn(User, "update").mockRejectedValueOnce(new Error());
      const id = 1;
      const user = new User();
      user.name = "any_name";
      user.email = "any_email@mail.com";
      user.password = "any_password";
      user.role = Roles.USER;

      await expect(userRepository.updateUser(id, user)).rejects.toThrow(Error);
    });
  });

  describe("deleteUser", () => {
    it("should delete the user and return null", async () => {
      const id = 1;

      jest.spyOn(User, "destroy").mockResolvedValueOnce(1);

      const result = await userRepository.deleteUser(id);
      expect(result).toBeNull();
    });

    it("should throw an error if an exception occurs", async () => {
      jest.spyOn(User, "destroy").mockRejectedValueOnce(new Error());
      const id = 1;
      await expect(userRepository.deleteUser(id)).rejects.toThrow(Error);
    });
  });

  describe("login", () => {
    it("should return the user if found with the given email and password", async () => {
      const email = "john.doe@example.com";
      const password = "password123";
      const user = new User();
      user.id = 1;
      user.name = "any_name";
      user.email = "any_email@mail.com";
      user.password = "any_password";
      user.role = Roles.USER;

      jest.spyOn(User, "findOne").mockResolvedValueOnce(user);

      const result = await userRepository.login(email, password);
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(user.id);
      expect(result?.name).toBe(user.name);
      expect(result?.email).toBe(user.email);
      expect(result?.password).toBe(user.password);
      expect(result?.role).toBe(user.role);
    });

    it("should return null if no user is found with the given email and password", async () => {
      const email = "john.doe@example.com";
      const password = "password123";

      jest.spyOn(User, "findOne").mockResolvedValueOnce(null);

      const result = await userRepository.login(email, password);
      expect(result).toBeNull();
    });

    it("should throw an error if an exception occurs", async () => {
      jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error());
      const email = "john.doe@example.com";
      const password = "password123";
      await expect(userRepository.login(email, password)).rejects.toThrow(
        Error
      );
    });
  });

  describe("getById", () => {
    it("should return the user if found with the given id", async () => {
      const id = 1;
      const user = new User();
      user.id = 1;
      user.name = "any_name";
      user.email = "any_email@mail.com";
      user.password = "any_password";
      user.role = Roles.USER;

      jest.spyOn(User, "findOne").mockResolvedValueOnce(user);

      const result = await userRepository.getById(id);
      expect(result).toBeInstanceOf(User);
      expect(result?.name).toBe(user.name);
      expect(result?.email).toBe(user.email);
      expect(result?.password).toBe(user.password);
      expect(result?.role).toBe(user.role);
    });

    it("should return null if no user is found with the given id", async () => {
      const id = 1;

      jest.spyOn(User, "findOne").mockResolvedValueOnce(null);

      const result = await userRepository.getById(id);
      expect(result).toBeNull();
    });

    it("should throw an error if an exception occurs", async () => {
      jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error());
      const id = 1;
      await expect(userRepository.getById(id)).rejects.toThrow(Error);
    });
  });
});
