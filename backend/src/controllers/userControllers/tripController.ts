import { Response } from "express";
import { ITripController, IAuthRequest } from "../../controllers/userControllers/Interface/ITripController"
import { ITripService, ICSVRow } from "../../services/userServie/interface/ITripService";
import Papa from "papaparse";

export class TripController implements ITripController {
  constructor(private tripService: ITripService) {}

  async uploadTrip(req: IAuthRequest, res: Response): Promise<void> {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      // Check if file exists
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No CSV file uploaded",
        });
        return;
      }

      // Check if tripName is provided
      const tripName = req.body.tripName;
      if (!tripName) {
        res.status(400).json({
          success: false,
          message: "Trip name is required",
        });
        return;
      }

      // Parse CSV file
      const csvContent = req.file.buffer.toString("utf-8");

      const parseResult = Papa.parse<ICSVRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      });

      if (parseResult.errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "CSV parsing error",
          errors: parseResult.errors,
        });
        return;
      }

      const csvData = parseResult.data;

      if (csvData.length === 0) {
        res.status(400).json({
          success: false,
          message: "CSV file is empty",
        });
        return;
      }

      // Validate CSV headers
      const requiredHeaders = ["latitude", "longitude", "timestamp", "ignition"];
      const headers = Object.keys(csvData[0]);
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required columns: ${missingHeaders.join(", ")}`,
        });
        return;
      }

      // Upload trip
      const result = await this.tripService.uploadTrip({
        userId: req.user.id,
        tripName,
        csvData,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Upload Trip Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUserTrips(req: IAuthRequest, res: Response): Promise<void> {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      const result = await this.tripService.getUserTrips(req.user.id);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get User Trips Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getTripDetails(req: IAuthRequest, res: Response): Promise<void> {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      const { tripId } = req.params;

      if (!tripId) {
        res.status(400).json({
          success: false,
          message: "Trip ID is required",
        });
        return;
      }

      const result = await this.tripService.getTripDetails(
        tripId,
        req.user.id
      );

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Get Trip Details Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getMultipleTrips(req: IAuthRequest, res: Response): Promise<void> {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      const { tripIds } = req.body;

      if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Trip IDs array is required",
        });
        return;
      }

      const result = await this.tripService.getMultipleTrips(
        tripIds,
        req.user.id
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get Multiple Trips Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteTrip(req: IAuthRequest, res: Response): Promise<void> {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      const { tripId } = req.params;

      if (!tripId) {
        res.status(400).json({
          success: false,
          message: "Trip ID is required",
        });
        return;
      }

      const result = await this.tripService.deleteTrip(tripId, req.user.id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Delete Trip Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}