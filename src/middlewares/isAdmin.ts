import { Request, Response, NextFunction } from "express";
import { Roles, RolesEnum } from "../types/User";

interface CustomRequest extends Request {
  userRole?: RolesEnum;
}

const isAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.userRole !== Roles.ADMIN) {
      return res.status(401).json({ mensagem: "User not authorized" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ mensagem: "Internal server error" });
  }
};

export default isAdmin;
