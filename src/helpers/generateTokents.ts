import { Context } from "hono";
import { sign } from "hono/jwt";

const generateAccessToken = async (user: any, c: Context) => {
  const payload = {
    id: user.id,
    exp:
      Math.floor(Date.now() / 1000) +
      60 * 60 * 24 * Number(c.env.ACCESS_TOKEN_EXPIRY),
  };
  return sign(payload, c.env.ACCESS_TOKEN_SECRET);
};

export { generateAccessToken };
