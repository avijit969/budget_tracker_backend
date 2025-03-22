import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { users } from "./db/schema";
import userRouter from "./routes/users.route";
import tripRouter from "./routes/trips.route";

export type Env = {
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
};
const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trip budget planner</title>
  </head>
  <body>
    <h1 style="text-align: center; margin-top: 50px ; font-size: 50px ; color: rgb(243, 159, 5);">
    Trip Budget Tracker server using Hono 🔥, Drizzle , cloudflare worker 
    </h1>
</body>
</html>`);
});

app.route("/user", userRouter);
app.route("/trip", tripRouter);
export default app;
