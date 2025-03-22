import {
  pgTable,
  varchar,
  text,
  timestamp,
  serial,
  integer,
  pgEnum,
  numeric,
  date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(), // Auto-incrementing primary key
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullname: varchar("fullname", { length: 255 }).notNull(),
  password: text("password").notNull(), // Store hashed passwords
  avatar: text("avatar"), // Optional field
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define enum for member status
export const memberStatus = pgEnum("member_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(), // Auto-incrementing ID
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  image: text("image").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tripMembers = pgTable("trip_members", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id, {
    onDelete: "cascade",
  }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  status: memberStatus("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define enum for payment mode
export const paymentModeEnum = pgEnum("payment_mode", ["cash", "online"]);

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // Use numeric for currency
  category: varchar("category", { length: 255 }).notNull(),
  date: date("date").notNull(),
  paymentMode: paymentModeEnum("payment_mode").notNull(),
  location: varchar("location", { length: 255 }),
  paidBy: integer("paid_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
