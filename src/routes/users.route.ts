import { Hono } from "hono";
import {
  createUser,
  deleteUser,
  getUser,
  loginUser,
  logoutUser,
  updateUser,
  updateUserAvatar,
} from "../controllers/user.controller";
import { verifyJwt } from "../helpers/verifyJwt";

const userRouter = new Hono();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/", verifyJwt, getUser);
userRouter.post("/logout", verifyJwt, logoutUser);
userRouter.patch("/avatar", verifyJwt, updateUserAvatar);
userRouter.patch("/profile", verifyJwt, updateUser);
userRouter.delete("/", verifyJwt, deleteUser);

export default userRouter;
