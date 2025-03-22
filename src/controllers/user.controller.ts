import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Context } from "hono";
import { and, eq, or } from "drizzle-orm";
import { users } from "../db/schema";
import { generateAccessToken } from "../helpers/generateTokents";
import hashPassword from "../helpers/hashPassword";
import { isPasswordCorrect } from "../helpers/verifyHashPassword";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { deleteCookie, setCookie } from "hono/cookie";

const getDb = (c: Context) => drizzle(neon(c.env.DATABASE_URL));

const createUser = async (c: Context) => {
  try {
    const db = getDb(c);
    const { username, email, password, fullname } = await c.req.json();
    if (!username || !email || !password || !fullname) {
      return c.json({ message: "All fields are required", status: 400 }, 400);
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .execute();

    if (existingUser.length > 0) {
      return c.json({ message: "User already exists", status: 400 }, 400);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await db
      .insert(users)
      .values({ username, email, password: hashedPassword, fullname })
      .returning({ id: users.id, username: users.username, email: users.email })
      .execute();

    return c.json(
      { message: "User created successfully", data: newUser[0], status: 201 },
      201
    );
  } catch (error: any) {
    return c.json(
      { message: "Server error", error: error.message, status: 500 },
      500
    );
  }
};

const loginUser = async (c: Context) => {
  try {
    const db = getDb(c);
    const { username, password } = await c.req.json();
    if (!username || !password) {
      return c.json({ message: "All fields are required", status: 400 }, 400);
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .execute();
    if (!user.length) {
      return c.json({ message: "User not found", status: 404 }, 404);
    }

    const isPasswordRight = await isPasswordCorrect(password, user[0].password);
    if (!isPasswordRight) {
      return c.json({ message: "Invalid credentials", status: 400 }, 400);
    }

    const accessToken = await generateAccessToken(user[0], c);
    setCookie(c, "accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 86400,
    });
    return c.json({
      message: "Login successful",
      data: { ...user[0], password: undefined },
      status: 200,
    });
  } catch (error: any) {
    return c.json(
      { message: "Server error", error: error.message, status: 500 },
      500
    );
  }
};

const getUser = async (c: Context) => {
  const db = getDb(c);
  const { id } = c.get("user");
  console.log(id);
  const user = await db.select().from(users).where(eq(users.id, id)).execute();
  if (!user.length) {
    return c.json({ message: "User not found", status: 404 }, 404);
  }
  return c.json({ message: "User found", data: user[0], status: 200 });
};

const logoutUser = async (c: Context) => {
  deleteCookie(c, "accessToken");
  return c.json({ message: "Logout successful", status: 200 });
};

const updateUserAvatar = async (c: Context) => {
  const db = getDb(c);
  const { id } = c.get("user");
  const body = await c.req.parseBody();
  const file = body.avatar as File;

  const result = await uploadOnCloudinary(file);
  if (!result) {
    return c.json({ message: "Error uploading file", status: 500 }, 500);
  }
  const updatedUser = await db
    .update(users)
    .set({ avatar: result.secure_url })
    .where(eq(users.id, id))
    .returning()
    .execute();
  return c.json({ message: "User updated successfully", data: updatedUser[0] });
};
const updateUser = async (c: Context) => {
  try {
    const db = getDb(c);
    const { id } = c.get("user");
    const body = await c.req.parseBody();
    const { fullname, username, email, avatar } = body;

    if (!fullname && !username && !email && !avatar) {
      return c.json({ message: "No fields to update", status: 400 }, 400);
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, username as string),
          eq(users.email, email as string)
        )
      )
      .execute();

    if (existingUser.length > 0) {
      return c.json(
        { message: "User already exists with username or email", status: 400 },
        400
      );
    }
    // upload avatar on cloudinary
    let avatarUrl = "";
    if (avatar) {
      const result = await uploadOnCloudinary(avatar as File);
      if (!result) {
        return c.json({ message: "Error uploading file", status: 500 }, 500);
      }
      avatarUrl = result.secure_url;
    }
    const updatedUser = await db
      .update(users)
      .set({
        fullname: fullname as string,
        username: username as string,
        email: email as string,
        avatar: avatarUrl,
      })
      .where(eq(users.id, id))
      .returning()
      .execute();

    return c.json({
      message: "User updated successfully",
      data: updatedUser[0],
      status: 200,
    });
  } catch (error: any) {
    return c.json(
      { message: "Server error", error: error.message, status: 500 },
      500
    );
  }
};

const deleteUser = async (c: Context) => {
  try {
    const db = getDb(c);
    const { id } = c.get("user");
    await db.delete(users).where(eq(users.id, id)).execute();
    return c.json({ message: "User deleted successfully", status: 200 });
  } catch (error: any) {
    return c.json(
      { message: "Server error", error: error.message, status: 500 },
      500
    );
  }
};

export {
  createUser,
  loginUser,
  getUser,
  logoutUser,
  updateUser,
  deleteUser,
  updateUserAvatar,
};
