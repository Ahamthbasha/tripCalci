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
  getMultipleTrips(req: IAuthRequest, res: Response): Promise<void>;
  deleteTrip(req: IAuthRequest, res: Response): Promise<void>;
}