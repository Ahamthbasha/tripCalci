import { ITrip } from "../../../models/tripModel";
import { ITripVisualizationDTO, IMultipleTripsVisualizationDTO } from "../../../dto/userDTO/ITripDTO";

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
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IGetTripDetailsResponse {
  success: boolean;
  message: string;
  trip?: ITrip;
}

export interface IGetTripVisualizationResponse {
  success: boolean;
  message: string;
  visualization?: ITripVisualizationDTO;
}

export interface IGetMultipleTripsVisualizationResponse {
  success: boolean;
  message: string;
  visualization?: IMultipleTripsVisualizationDTO;
}

export interface ITripService {
  uploadTrip(data: IUploadTripRequest): Promise<IUploadTripResponse>;
  getUserTrips(userId: string, page: number, limit: number): Promise<IGetTripsResponse>;
  
  getTripVisualization(
    tripId: string, 
    userId: string, 
    page?: number, 
    pageSize?: number
  ): Promise<IGetTripVisualizationResponse>;

  getMultipleTripsVisualization(
    tripIds: string[], 
    userId: string
  ): Promise<IGetMultipleTripsVisualizationResponse>;
  
  deleteTrip(tripId: string, userId: string): Promise<{ success: boolean; message: string }>;
}