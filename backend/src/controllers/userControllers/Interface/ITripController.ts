// controllers/userControllers/Interface/ITripController.ts
import { Request, Response } from "express";

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ITripController {
  uploadTrip(req: IAuthRequest, res: Response): Promise<void>;
  getUserTrips(req: IAuthRequest, res: Response): Promise<void>;
  getTripDetails(req: IAuthRequest, res: Response): Promise<void>;
  getTripVisualization(req: IAuthRequest, res: Response): Promise<void>; // NEW
  getMultipleTrips(req: IAuthRequest, res: Response): Promise<void>;
  getMultipleTripsVisualization(req: IAuthRequest, res: Response): Promise<void>; // NEW
  deleteTrip(req: IAuthRequest, res: Response): Promise<void>;
}