import { ITrip } from "../../../models/tripModel";

export interface ICSVRow {
  latitude: string;
  longitude: string;
  timestamp: string;
  ignition: string;
}

export interface IUploadTripRequest {
  userId: string;
  tripName: string;
  csvData: ICSVRow[];
}

export interface IUploadTripResponse {
  success: boolean;
  message: string;
  trip?: {
    id: string;
    tripName: string;
    uploadDate: Date;
    summary: {
      totalDistance: number;
      totalDuration: number;
      stoppageDuration: number;
      idlingDuration: number;
      overspeedCount: number;
      maxSpeed: number;
      avgSpeed: number;
    };
  };
}

export interface IGetTripsResponse {
  success: boolean;
  message: string;
  trips?: Array<{
    id: string;
    tripName: string;
    uploadDate: Date;
    summary: {
      totalDistance: number;
      totalDuration: number;
      stoppageDuration: number;
      idlingDuration: number;
      overspeedCount: number;
      maxSpeed: number;
      avgSpeed: number;
    };
    isProcessed: boolean;
  }>;
}

export interface IGetTripDetailsResponse {
  success: boolean;
  message: string;
  trip?: ITrip;
}

export interface ITripService {
  
  uploadTrip(data: IUploadTripRequest): Promise<IUploadTripResponse>;
  getUserTrips(userId: string): Promise<IGetTripsResponse>;
  getTripDetails(tripId: string, userId: string): Promise<IGetTripDetailsResponse>;
  getMultipleTrips(tripIds: string[], userId: string): Promise<IGetTripsResponse>;
  deleteTrip(tripId: string, userId: string): Promise<{ success: boolean; message: string }>;
}