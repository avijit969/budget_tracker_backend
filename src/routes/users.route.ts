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

userRouter.post("/create-user", createUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/get-user", verifyJwt, getUser);
userRouter.post("/logout-user", verifyJwt, logoutUser);
userRouter.patch("/update-user-avatar", verifyJwt, updateUserAvatar);
userRouter.patch("/update-user", verifyJwt, updateUser);
userRouter.delete("/delete-user", verifyJwt, deleteUser);

export default userRouter;
