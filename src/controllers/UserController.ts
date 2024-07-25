import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import User from "../entities/User";
import serverConfig from "../config/server";

export class UserController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.userRepository.getAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = req.body as User;
      user.password = await bcrypt.hash(req.body.password, 10);
      const createdUser = await this.userRepository.createUser(user);
      res.json(createdUser);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = req.body as User;
      const updatedUser = await this.userRepository.updateUser(id, user);
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.userRepository.deleteUser(id);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      let match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Password incorrect" });
      }

      const token = jwt.sign({ id: user.id }, serverConfig.JWT_SECRET);

      return res.json({ token });
    } catch (error) {
      return res.status(500).json({ message: "Error authenticating User" });
    }
  }
}
