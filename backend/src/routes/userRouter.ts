import { Router } from "express";
import { authMiddleware, userController, userTripController } from "../config/dependencyInjector";
import { uploadCsv } from "../utils/multerConfig";

const router = Router()

router.post(
    "/login",
    userController.login.bind(userController)
)

router.post(
    "/logout",
    userController.logout.bind(userController)
)

//Trip detail

router.post(
    "/trips/upload",
    authMiddleware.authenticateToken,
    uploadCsv.single('file'),
    userTripController.uploadTrip.bind(userTripController)
)

router.get(
    "/trips",
    authMiddleware.authenticateToken,
    userTripController.getUserTrips.bind(userTripController)
)

router.get(
    "/trip/:tripId/visualization",
    authMiddleware.authenticateToken,
    userTripController.getTripVisualization.bind(userTripController)
)

router.get(
    "/trips/visualization",
    authMiddleware.authenticateToken,
    userTripController.getMultipleTripsVisualization.bind(userTripController)
)

router.delete(
    "/trips/:tripId",
    authMiddleware.authenticateToken,
    userTripController.deleteTrip.bind(userTripController)
)

export default router