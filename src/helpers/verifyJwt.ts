import { Context } from "hono";
import { getToken } from "./getToken";
import { verify } from "hono/jwt";

const verifyJwt = async (c: Context, next: any) => {
  const token = getToken(c);
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  try {
    const decoded = await verify(token, c.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);
    c.set("user", decoded);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
};

export { verifyJwt };
