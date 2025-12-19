import { Response } from "express";
import { AuthenticatedRequest } from "../../../interface/express"; 

export interface ITripController {
  uploadTrip(req: AuthenticatedRequest, res: Response): Promise<void>;
  getUserTrips(req: AuthenticatedRequest, res: Response): Promise<void>;
  getTripVisualization(req: AuthenticatedRequest, res: Response): Promise<void>;
  getMultipleTripsVisualization(req: AuthenticatedRequest, res: Response): Promise<void>;
  deleteTrip(req: AuthenticatedRequest, res: Response): Promise<void>;
}