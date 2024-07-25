import { Router } from "express";
import { UserController } from "../controllers/UserController";
import checkJwtTokenExistence from "../middlewares/checkJwtTokenExistence";
import isAdmin from "../middlewares/isAdmin";
import { UserRepository } from "../repositories/UserRepository";

const router = Router();
const userRepository = new UserRepository();
const userController = new UserController(userRepository);

router.get(
  "/users",
  checkJwtTokenExistence,
  isAdmin,
  userController.getAll.bind(userController)
);
router.post("/users", userController.createUser.bind(userController));
router.put(
  "/users/:id",
  checkJwtTokenExistence,
  isAdmin,
  userController.updateUser.bind(userController)
);
router.delete(
  "/users/:id",
  checkJwtTokenExistence,
  isAdmin,
  userController.deleteUser.bind(userController)
);
router.post("/login", userController.authenticate.bind(userController));

export default router;
