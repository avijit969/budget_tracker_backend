import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { tripMembers, trips, users } from "../db/schema";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { and, eq, or } from "drizzle-orm";

const getDb = (c: Context) => drizzle(neon(c.env.DATABASE_URL));
type tripType = {
  title: string;
  description: string;
  location: string;
  image: File;
};
const createTrip = async (c: Context) => {
  try {
    const db = getDb(c);
    const { id } = c.get("user");
    const { title, description, image, location }: tripType =
      await c.req.parseBody();

    if (!title || !description || !image) {
      return c.json({ message: "Missing required fields" }, 400);
    }

    // Upload image to storage (implement this function)
    const imageUrl = await uploadOnCloudinary(image as File);
    if (!imageUrl) {
      return c.json({ message: "Error uploading image" }, 500);
    }
    const newTrip = await db
      .insert(trips)
      .values({
        title: title,
        description,
        image: imageUrl.secure_url,
        createdAt: new Date(),
        creatorId: id,
        location: location,
      })
      .returning({
        id: trips.id,
        title: trips.title,
        description: trips.description,
        image: trips.image,
      })
      .execute();

    return c.json({ message: "Trip created successfully", data: newTrip[0] });
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};

const getAllTrips = async (c: Context) => {
  try {
    const db = getDb(c);
    const user = c.get("user"); // Ensure user exists

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const allTrips = await db
      .select({
        id: trips.id,
        title: trips.title,
        description: trips.description,
        image: trips.image,
        location: trips.location,
        createdAt: trips.createdAt,
        creator: {
          id: users.id,
          name: users.username,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(trips)
      .leftJoin(users, eq(trips.creatorId, users.id))
      .where(eq(trips.creatorId, user.id)) // Filter by current user
      .execute();

    return c.json(allTrips);
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};

const getTripById = async (c: Context) => {
  try {
    const db = getDb(c);
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ message: "Invalid trip ID" }, 400);
    }
    const tripData = await db
      .select({
        id: trips.id,
        title: trips.title,
        description: trips.description,
        image: trips.image,
        location: trips.location,
        createdAt: trips.createdAt,
        creator: {
          id: users.id,
          name: users.username,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(trips)
      .leftJoin(users, eq(trips.creatorId, users.id))
      .where(eq(trips.id, id))
      .execute();

    if (tripData.length === 0) {
      return c.json({ message: "Trip not found" }, 404);
    }

    return c.json(
      {
        message: "Trip found",
        dta: tripData[0],
        sucess: true,
      },
      200
    );
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};
const updateTrip = async (c: Context) => {
  try {
    const db = getDb(c);
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ message: "Invalid trip ID" }, 400);
    }

    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, id))
      .execute();

    if (tripData.length === 0) {
      return c.json({ message: "Trip not found" }, 404);
    }

    const { title, description, image, location }: tripType =
      await c.req.parseBody();

    if (!title && !description && !image && !location && !tripData) {
      return c.json({ message: "No files to update" }, 400);
    }
    let imageUrl = tripData[0].image;
    if (image) {
      const response = await uploadOnCloudinary(image as File);
      imageUrl = response?.secure_url as string;
      if (!imageUrl) {
        return c.json({ message: "Error uploading image" }, 500);
      }
    }

    const updatedTrip = await db
      .update(trips)
      .set({
        title: title,
        description: description,
        image: imageUrl,
        location: location,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, id))
      .returning({
        id: trips.id,
        title: trips.title,
        description: trips.description,
        image: trips.image,
        location: trips.location,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      })
      .execute();
    if (!updatedTrip) {
      return c.json({ message: "Trip not found" }, 404);
    }

    return c.json(
      {
        message: "Trip updated successfully",
        data: updatedTrip[0],
        sucess: true,
      },
      200
    );
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};
const inviteTrip = async (c: Context) => {
  try {
    const db = getDb(c);
    const userId = c.get("user").id;
    const tripId = Number(c.req.param("id"));
    console.log(tripId, userId);
    if (!tripId || !userId) {
      return c.json({ message: "All fields are required" }, 400);
    }

    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .execute();

    if (tripData.length === 0) {
      return c.json({ message: "Trip not found" }, 404);
    }
    const isIvitationAlreadySent = await db
      .select()
      .from(tripMembers)
      .where(
        and(eq(tripMembers.userId, userId), eq(tripMembers.tripId, tripId))
      )
      .execute();

    if (isIvitationAlreadySent.length > 0) {
      return c.json({ message: "Invitation already sent" }, 400);
    }

    const invitation = await db
      .insert(tripMembers)
      .values({
        tripId: tripId,
        userId: userId,
        status: "pending",
      })
      .returning({
        id: tripMembers.id,
        tripId: tripMembers.tripId,
        userId: tripMembers.userId,
      })
      .execute();

    return c.json(
      {
        message: "Invitation sent successfully",
        data: invitation,
      },
      200
    );
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};
const acceptTrip = async (c: Context) => {
  try {
    const db = getDb(c);
    const tripId = Number(c.req.param("id"));
    const userId = c.get("user").id;

    if (!tripId || !userId) {
      return c.json({ message: "All fields are required" }, 400);
    }

    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .execute();

    if (tripData.length === 0) {
      return c.json({ message: "Trip not found" }, 404);
    }

    const invitation = await db
      .update(tripMembers)
      .set({ status: "accepted" })
      .where(
        and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId))
      )
      .returning({
        id: tripMembers.id,
        tripId: tripMembers.tripId,
        userId: tripMembers.userId,
        status: tripMembers.status,
      })
      .execute();

    return c.json(
      {
        message: "Invitation accepted successfully",
        data: invitation,
      },
      200
    );
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};
const rejectTrip = async (c: Context) => {
  try {
    const db = getDb(c);
    const tripId = Number(c.req.param("id"));
    const userId = c.get("user").id;

    if (!tripId || !userId) {
      return c.json({ message: "All fields are required" }, 400);
    }

    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .execute();

    if (tripData.length === 0) {
      return c.json({ message: "Trip not found" }, 404);
    }

    const invitation = await db
      .update(tripMembers)
      .set({ status: "rejected" })
      .where(
        and(
          eq(tripMembers.tripId, tripId),
          eq(tripMembers.userId, userId),
          eq(tripMembers.status, "pending")
        )
      )
      .returning({
        id: tripMembers.id,
        tripId: tripMembers.tripId,
        userId: tripMembers.userId,
        status: tripMembers.status,
      })
      .execute();
    if (invitation.length === 0) {
      return c.json({ message: "Invitation not found" }, 404);
    }
    return c.json(
      {
        message: "Invitation rejected successfully",
        data: invitation,
      },
      200
    );
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};

const deleteTrip = async (c: Context) => {
  try {
    const db = getDb(c);
    const tripId = Number(c.req.param("id"));
    const userId = c.get("user").id;

    if (!tripId || !userId) {
      return c.json({ message: "All fields are required" }, 400);
    }

    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .execute();

    if (tripData.length === 0) {
      return c.json({ message: "Trip not found" }, 404);
    }

    const invitation = await db
      .delete(tripMembers)
      .where(
        and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId))
      )
      .returning({
        id: tripMembers.id,
        tripId: tripMembers.tripId,
        userId: tripMembers.userId,
        status: tripMembers.status,
      })
      .execute();
    if (invitation) {
      const trip = await db
        .delete(tripMembers)
        .where(and(eq(tripMembers.tripId, tripId)))
        .execute();
    }
    const trip = await db
      .delete(trips)
      .where(and(eq(trips.id, tripId), eq(trips.creatorId, userId)))
      .execute();
    return c.json({ message: "Trip deleted successfully" }, 200);
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};
const leaveTrip = async (c: Context) => {
  try {
    const db = getDb(c);
    const tripId = Number(c.req.param("id"));
    const userId = c.get("user").id;

    if (!tripId || !userId) {
      return c.json({ message: "All fields are required" }, 400);
    }

    const tripData = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .execute();

    if (tripData.length === 0) {
      return c.json({ message: "Trip not found" }, 404);
    }

    const invitation = await db
      .delete(tripMembers)
      .where(
        and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId))
      )
      .returning({
        id: tripMembers.id,
        tripId: tripMembers.tripId,
        userId: tripMembers.userId,
        status: tripMembers.status,
      })
      .execute();

    if (invitation.length === 0) {
      return c.json({ message: "Invitation not found" }, 404);
    }

    return c.json({ message: "Trip left successfully", data: invitation }, 200);
  } catch (error: any) {
    return c.json({ message: "Server error", error: error.message }, 500);
  }
};

export {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  inviteTrip,
  acceptTrip,
  rejectTrip,
  leaveTrip,
  deleteTrip,
};
