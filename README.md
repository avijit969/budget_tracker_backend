# ✈️ Trip Budget Tracker Backend

A powerful and efficient backend for managing trip budgets, built with modern web technologies for speed and scalability.

## 🚀 Technologies Used

- **🟦 TypeScript** – Strongly typed JavaScript for better code reliability.
- **⚡ Bun** – Fast and lightweight JavaScript runtime.
- **🔥 Hono** – Ultra-lightweight web framework for Cloudflare Workers.
- **☁️ Cloudflare Workers** – Serverless execution for lightning-fast performance.
- **🗄️ Drizzle ORM** – Simple, type-safe, and efficient database interaction.
- **🐘 PostgreSQL** – Robust and scalable relational database.
- **🌱 Neon Database** – Serverless PostgreSQL with instant branching.
- **📸 Cloudinary** – Media storage and optimization for images.

## ✨ Features

✅ **User Authentication & Authorization** – Secure access to trip data.  
✅ **User Profile Management** – Update and manage user details.  
✅ **Trip Management** – Create, update, and delete trips easily.  
✅ **Collaborative Planning** – Invite friends, accept/reject invitations, and leave trips.

## ⚙️ Installation

```sh
bun install
```

## 🚀 Usage

```sh
bun run dev
```

## 🚀 Deployment

```sh
bun run deploy
```

## Api Endpoints

### Endpoints for trips

| Endpoint               | Method | Description                     |
| ---------------------- | ------ | ------------------------------- |
| `/api/trip`            | POST   | Create a new trip.              |
| `/api/trip`            | GET    | Get all trips.                  |
| `/api/trip/:id`        | GET    | Get a specific trip by ID.      |
| `/api/trip/:id`        | PUT    | Update a specific trip by ID.   |
| `/api/trip/:id`        | DELETE | Delete a specific trip by ID.   |
| `/api/trip/:id/invite` | POST   | Invite a friend to a trip.      |
| `/api/trip/:id/accept` | POST   | Accept an invitation to a trip. |
| `/api/trip/:id/reject` | POST   | Reject an invitation to a trip. |
| `/api/trip/:id/leave`  | POST   | Leave a trip.                   |
| `/api/trip/:id/delete` | POST   | Delete a trip.                  |
| `/api/trip/allmembers` | GET    | Get all members of a trip.      |

### Endpoints for users

| Endpoint            | Method | Description                            | Body                                                                      |
| ------------------- | ------ | -------------------------------------- | ------------------------------------------------------------------------- |
| `/api/user`         | POST   | Create a new user.                     | username, email, password                                                 |
| `/api/user/login`   | POST   | Log in a user.                         | username, password                                                        |
| `/api/user/logout`  | POST   | Log out a user.                        | authorization header Bearer token                                         |
| `/api/user`         | GET    | Get a specific user by ID.             | authorization header Bearer token                                         |
| `/api/user/avatar`  | PATCH  | Update a specific user's avatar by ID. | authorization header Bearer token, avatar file                            |
| `/api/user/profile` | PATCH  | Update a specific user by ID.          | authorization header Bearer token and username,email,fullname,avatar file |
| `/api/user`         | DELETE | Delete a specific user by ID.          | authorization header Bearer token                                         |
