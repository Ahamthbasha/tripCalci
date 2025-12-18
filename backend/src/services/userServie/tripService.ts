import {
  ITripService,
  IUploadTripRequest,
  IUploadTripResponse,
  IGetTripsResponse,
  IGetTripDetailsResponse,
  IGetTripVisualizationResponse,
  IGetMultipleTripsVisualizationResponse,
} from "./interface/ITripService";
import { ITripRepo } from "../../repositories/userRepo/interface/ITripRepo";
import { ITripCalculationService } from "./interface/ITripCalculationService";
import { IGPSPoint } from "../../models/tripModel";
import { TripDTOMapper } from "../../mapper/userMapper/tripDTOMapper";

export class TripService implements ITripService {
  private _tripRepo: ITripRepo;
  private _calculationService: ITripCalculationService;
  private _dtoMapper: TripDTOMapper;

  constructor(
    tripRepo: ITripRepo,
    calculationService: ITripCalculationService
  ) {
    this._tripRepo = tripRepo;
    this._calculationService = calculationService;
    this._dtoMapper = new TripDTOMapper();
  }

  async uploadTrip(data: IUploadTripRequest): Promise<IUploadTripResponse> {
    try {
      const { userId, tripName, csvData } = data;

      if (!csvData || csvData.length === 0) {
        return {
          success: false,
          message: "CSV data is empty or invalid",
        };
      }

      const gpsPoints: IGPSPoint[] = [];

      for (const row of csvData) {
        const latitude = parseFloat(row.latitude);
        const longitude = parseFloat(row.longitude);
        const timestamp = new Date(row.timestamp);
        const ignition = row.ignition.toLowerCase() as "on" | "off";

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

      const calculations =
        this._calculationService.calculateTripMetrics(gpsPoints);

      const trip = await this._tripRepo.create({
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

  async getUserTrips(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IGetTripsResponse> {
    try {
      const [trips, totalCount] = await Promise.all([
        this._tripRepo.findPaginatedByUserId(userId, page, limit),
        this._tripRepo.countByUserId(userId),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

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
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Get User Trips Error:", error);
      return {
        success: false,
        message: "Failed to fetch trips",
      };
    }
  }

  async getTripDetails(
    tripId: string,
    userId: string
  ): Promise<IGetTripDetailsResponse> {
    try {
      const trip = await this._tripRepo.findByIdAndUserId(tripId, userId);

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

  async getTripVisualization(
    tripId: string,
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<IGetTripVisualizationResponse> {
    try {
      const trip = await this._tripRepo.findByIdAndUserId(tripId, userId);

      if (!trip) {
        return {
          success: false,
          message: "Trip not found or access denied",
        };
      }

      const visualization = this._dtoMapper.mapTripToVisualizationDTO(
        trip,
        page,
        pageSize
      );

      return {
        success: true,
        message: "Trip visualization data fetched successfully",
        visualization,
      };
    } catch (error) {
      console.error("Get Trip Visualization Error:", error);
      return {
        success: false,
        message: "Failed to fetch trip visualization",
      };
    }
  }

  async getMultipleTrips(
    tripIds: string[],
    userId: string
  ): Promise<IGetTripsResponse> {
    try {
      const trips = await this._tripRepo.findMultipleByIdsAndUserId(
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

  async getMultipleTripsVisualization(
    tripIds: string[],
    userId: string
  ): Promise<IGetMultipleTripsVisualizationResponse> {
    try {
      const trips = await this._tripRepo.findMultipleByIdsAndUserId(
        tripIds,
        userId
      );

      if (trips.length === 0) {
        return {
          success: false,
          message: "No trips found",
        };
      }

      const visualization =
        this._dtoMapper.mapMultipleTripsToVisualizationDTO(trips);

      return {
        success: true,
        message: "Multiple trips visualization fetched successfully",
        visualization,
      };
    } catch (error) {
      console.error("Get Multiple Trips Visualization Error:", error);
      return {
        success: false,
        message: "Failed to fetch multiple trips visualization",
      };
    }
  }

  async deleteTrip(
    tripId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const trip = await this._tripRepo.findByIdAndUserId(tripId, userId);

      if (!trip) {
        return {
          success: false,
          message: "Trip not found or access denied",
        };
      }

      const deleted = await this._tripRepo.delete(tripId);

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