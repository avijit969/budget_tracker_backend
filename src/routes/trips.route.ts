import { Hono } from "hono";
import {
  acceptTrip,
  createTrip,
  deleteTrip,
  getAllMembers,
  getAllTrips,
  getTripById,
  inviteTrip,
  leaveTrip,
  rejectTrip,
  updateTrip,
} from "../controllers/trip.controller";
import { verifyJwt } from "../helpers/verifyJwt";

const tripRouter = new Hono();

tripRouter.post("/", verifyJwt, createTrip);
tripRouter.get("/", verifyJwt, getAllTrips);
tripRouter.get("/:id", verifyJwt, getTripById);
tripRouter.patch("/:id", verifyJwt, updateTrip);
tripRouter.post("/:id/invite", verifyJwt, inviteTrip);
tripRouter.post("/:id/accept", verifyJwt, acceptTrip);
tripRouter.post("/:id/reject", verifyJwt, rejectTrip);
tripRouter.get("/get-all-members/:id", verifyJwt, getAllMembers);
tripRouter.delete("/:id/leave", verifyJwt, leaveTrip);
tripRouter.delete("/:id", verifyJwt, deleteTrip);
export default tripRouter;
