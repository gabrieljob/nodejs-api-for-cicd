import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";
import { RolesEnum } from "../types/User";
import serverConfig from "../config/server";

interface CustomRequest extends Request {
  token?: JwtPayload;
  userRole?: RolesEnum;
}

const checkJwtTokenExistence = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ mensagem: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      serverConfig.JWT_SECRET
    ) as JwtPayload;
    req.token = decoded;

    const userId = decoded.id;
    const userRepository = new UserRepository();
    const user = await userRepository.getById(userId);

    if (!user) {
      return res.status(401).json({ mensagem: "User not found" });
    }

    req.userRole = user.role;

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Invalid token" });
  }
};

export default checkJwtTokenExistence;
