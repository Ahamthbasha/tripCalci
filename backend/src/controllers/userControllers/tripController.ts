import { Response } from "express";
import {
  ITripController
} from "./Interface/ITripController";
import { ITripService, ICSVRow } from "../../services/userServie/interface/ITripService";
import Papa from "papaparse";
import { AuthenticatedRequest } from "../../interface/express";
export class TripController implements ITripController {
  private _tripService: ITripService;
  
  constructor(tripService: ITripService) {
    this._tripService = tripService;
  }

  async uploadTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      const file = req.file;
      const rawTripName = req.body.tripName;

      if (!rawTripName || typeof rawTripName !== "string") {
        res.status(400).json({
          success: false,
          message: "Trip name is required",
        });
        return;
      }

      const tripName = rawTripName.trim();

      if (tripName.length === 0) {
        res.status(400).json({
          success: false,
          message: "Trip name cannot be empty or just whitespace",
        });
        return;
      }

      if (tripName.length < 5) {
        res.status(400).json({
          success: false,
          message: "Trip name must be at least 5 characters long",
        });
        return;
      }

      if (!/^[a-zA-Z][a-zA-Z\s-]*$/.test(tripName)) {
        res.status(400).json({
          success: false,
          message:
            "Trip name must start with a letter and contain only letters, spaces, and hyphens (-)",
        });
        return;
      }

      if (!file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      const allowedExtensions = [".csv", ".xlsx", ".xls"];
      const fileExtension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf("."));
      
      if (!allowedExtensions.includes(fileExtension)) {
        res.status(400).json({
          success: false,
          message: "Only CSV or Excel files are allowed (.csv, .xlsx, .xls)",
        });
        return;
      }

      const allowedMimes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/csv",
        "application/x-csv",
      ];

      if (!allowedMimes.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          message: "Invalid file type. Please upload a valid CSV or Excel file.",
        });
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 10MB.",
        });
        return;
      }

      let csvData: ICSVRow[] = [];

      try {
        const fileContent = file.buffer.toString("utf-8");

        const parseResult = Papa.parse<ICSVRow>(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().toLowerCase(),
        });

        if (parseResult.errors.length > 0) {
          res.status(400).json({
            success: false,
            message: "Error parsing file",
            errors: parseResult.errors.slice(0, 5),
          });
          return;
        }

        csvData = parseResult.data;

        if (csvData.length === 0) {
          res.status(400).json({
            success: false,
            message: "File is empty or contains no valid data rows",
          });
          return;
        }
      } catch (parseError) {
        res.status(400).json({
          success: false,
          message: "Failed to read or parse the file",
        });
        return;
      }

      const requiredHeaders = ["latitude", "longitude", "timestamp", "ignition"];
      const headers = Object.keys(csvData[0]).map((h) => h.toLowerCase());
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

      if (missingHeaders.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required columns: ${missingHeaders.join(", ")}`,
        });
        return;
      }

      const result = await this._tripService.uploadTrip({
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
        message: "Internal server error. Please try again later.",
      });
    }
  }

  async getUserTrips(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        res.status(400).json({
          success: false,
          message: "Invalid pagination parameters",
        });
        return;
      }

      const result = await this._tripService.getUserTrips(
        req.user.id,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get User Trips Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getTripDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
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

      const result = await this._tripService.getTripDetails(
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

  // NEW: Get Trip Visualization (formatted for frontend display)
  async getTripVisualization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
        return;
      }

      const { tripId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      if (!tripId) {
        res.status(400).json({
          success: false,
          message: "Trip ID is required",
        });
        return;
      }

      const result = await this._tripService.getTripVisualization(
        tripId,
        req.user.id,
        page,
        pageSize
      );

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Get Trip Visualization Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getMultipleTrips(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
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

      const result = await this._tripService.getMultipleTrips(
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

  // NEW: Get Multiple Trips Visualization (for map overlay)
  async getMultipleTripsVisualization(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
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

      const result = await this._tripService.getMultipleTripsVisualization(
        tripIds,
        req.user.id
      );

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Get Multiple Trips Visualization Controller Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
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

      const result = await this._tripService.deleteTrip(tripId, req.user.id);

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