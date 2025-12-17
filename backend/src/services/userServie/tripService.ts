import {
  ITripService,
  IUploadTripRequest,
  IUploadTripResponse,
  IGetTripsResponse,
  IGetTripDetailsResponse,
} from "./interface/ITripService";
import { ITripRepo } from "../../repositories/userRepo/interface/ITripRepo"; 
import { ITripCalculationService } from "./interface/ITripCalculationService";
import { IGPSPoint } from "../../models/tripModel";

export class TripService implements ITripService {
  constructor(
    private tripRepo: ITripRepo,
    private calculationService: ITripCalculationService
  ) {}

  async uploadTrip(data: IUploadTripRequest): Promise<IUploadTripResponse> {
    try {
      const { userId, tripName, csvData } = data;

      // Validate CSV data
      if (!csvData || csvData.length === 0) {
        return {
          success: false,
          message: "CSV data is empty or invalid",
        };
      }

      // Parse and validate GPS points
      const gpsPoints: IGPSPoint[] = [];

      for (const row of csvData) {
        const latitude = parseFloat(row.latitude);
        const longitude = parseFloat(row.longitude);
        const timestamp = new Date(row.timestamp);
        const ignition = row.ignition.toLowerCase() as "on" | "off";

        // Validate data
        if (
          isNaN(latitude) ||
          isNaN(longitude) ||
          isNaN(timestamp.getTime()) ||
          !["on", "off"].includes(ignition)
        ) {
          return {
            success: false,
            message: "Invalid GPS data format in CSV",
          };
        }

        gpsPoints.push({
          latitude,
          longitude,
          timestamp,
          ignition,
          speed: 0,
        });
      }

      // Calculate trip metrics
      const calculations =
        this.calculationService.calculateTripMetrics(gpsPoints);

      // Create trip in database
      const trip = await this.tripRepo.create({
        userId,
        tripName,
        uploadDate: new Date(),
        gpsPoints: calculations.gpsPointsWithSpeed,
        summary: calculations.summary,
        stoppages: calculations.stoppages,
        idlings: calculations.idlings,
        overspeedSegments: calculations.overspeedSegments,
        isProcessed: true,
      } as any);

      return {
        success: true,
        message: "Trip uploaded and processed successfully",
        trip: {
          id: trip._id.toString(),
          tripName: trip.tripName,
          uploadDate: trip.uploadDate,
          summary: trip.summary,
        },
      };
    } catch (error) {
      console.error("Upload Trip Error:", error);
      return {
        success: false,
        message: "Failed to upload trip",
      };
    }
  }

  async getUserTrips(userId: string): Promise<IGetTripsResponse> {
    try {
      const trips = await this.tripRepo.findByUserId(userId);

      return {
        success: true,
        message: "Trips fetched successfully",
        trips: trips.map((trip) => ({
          id: trip._id.toString(),
          tripName: trip.tripName,
          uploadDate: trip.uploadDate,
          summary: trip.summary,
          isProcessed: trip.isProcessed,
        })),
      };
    } catch (error) {
      console.error("Get User Trips Error:", error);
      return {
        success: false,
        message: "Failed to fetch trips",
        trips: [],
      };
    }
  }

  async getTripDetails(
    tripId: string,
    userId: string
  ): Promise<IGetTripDetailsResponse> {
    try {
      const trip = await this.tripRepo.findByIdAndUserId(tripId, userId);

      if (!trip) {
        return {
          success: false,
          message: "Trip not found or access denied",
        };
      }

      return {
        success: true,
        message: "Trip details fetched successfully",
        trip,
      };
    } catch (error) {
      console.error("Get Trip Details Error:", error);
      return {
        success: false,
        message: "Failed to fetch trip details",
      };
    }
  }

  async getMultipleTrips(
    tripIds: string[],
    userId: string
  ): Promise<IGetTripsResponse> {
    try {
      const trips = await this.tripRepo.findMultipleByIdsAndUserId(
        tripIds,
        userId
      );

      return {
        success: true,
        message: "Trips fetched successfully",
        trips: trips.map((trip) => ({
          id: trip._id.toString(),
          tripName: trip.tripName,
          uploadDate: trip.uploadDate,
          summary: trip.summary,
          isProcessed: trip.isProcessed,
        })),
      };
    } catch (error) {
      console.error("Get Multiple Trips Error:", error);
      return {
        success: false,
        message: "Failed to fetch trips",
        trips: [],
      };
    }
  }

  async deleteTrip(
    tripId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // First verify the trip belongs to the user
      const trip = await this.tripRepo.findByIdAndUserId(tripId, userId);

      if (!trip) {
        return {
          success: false,
          message: "Trip not found or access denied",
        };
      }

      // Delete the trip
      const deleted = await this.tripRepo.delete(tripId);

      if (!deleted) {
        return {
          success: false,
          message: "Failed to delete trip",
        };
      }

      return {
        success: true,
        message: "Trip deleted successfully",
      };
    } catch (error) {
      console.error("Delete Trip Error:", error);
      return {
        success: false,
        message: "Failed to delete trip",
      };
    }
  }
}