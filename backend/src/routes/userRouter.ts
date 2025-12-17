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
    "/upload",
    authMiddleware.authenticateToken,
    uploadCsv.single('file'),
    userTripController.uploadTrip.bind(userTripController)
)

router.get(
    "/getAllTrips",
    authMiddleware.authenticateToken,
    userTripController.getUserTrips.bind(userTripController)
)

router.get(
    "/trips/:tripId",
    authMiddleware.authenticateToken,
    userTripController.getTripDetails.bind(userTripController)
)

router.post(
    "/multiple",
    authMiddleware.authenticateToken,
    userTripController.getMultipleTrips.bind(userTripController)
)

router.delete(
    "/trips/:tripId",
    authMiddleware.authenticateToken,
    userTripController.deleteTrip.bind(userTripController)
)

export default router