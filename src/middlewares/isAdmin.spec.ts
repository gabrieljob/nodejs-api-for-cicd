import { Roles } from "../types/User";
import isAdmin from "./isAdmin";
import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  userRole?: Roles;
}

describe("isAdmin", () => {
  let req: CustomRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as CustomRequest;
    res = {} as Response;
    next = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
  });

  it("should call next() if userRole is ADMIN", async () => {
    req.userRole = Roles.ADMIN;

    await isAdmin(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if userRole is not ADMIN", async () => {
    req.userRole = Roles.USER;

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "User not authorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if an error occurs", async () => {
    req.userRole = Roles.ADMIN;
    next = jest.fn().mockImplementation(() => {
      throw new Error("Some error");
    });

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: "Internal server error",
    });
  });
});
