import { Hono } from "hono";
import {
  acceptTrip,
  createTrip,
  deleteTrip,
  getAllTrips,
  getTripById,
  inviteTrip,
  leaveTrip,
  rejectTrip,
  updateTrip,
} from "../controllers/trip.controller";
import { verifyJwt } from "../helpers/verifyJwt";

const tripRouter = new Hono();

tripRouter.post("/create-trip", verifyJwt, createTrip);
tripRouter.get("/get-all-trips", verifyJwt, getAllTrips);
tripRouter.get("/get-trip/:id", verifyJwt, getTripById);
tripRouter.patch("/update-trip/:id", verifyJwt, updateTrip);
tripRouter.post("/invite-trip/:id", verifyJwt, inviteTrip);
tripRouter.post("/accept-trip/:id", verifyJwt, acceptTrip);
tripRouter.post("/reject-trip/:id", verifyJwt, rejectTrip);
tripRouter.delete("/leave-trip/:id", verifyJwt, leaveTrip);
tripRouter.delete("/delete-trip/:id", verifyJwt, deleteTrip);

export default tripRouter;
