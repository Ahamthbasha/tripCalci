import {
  IGPSPoint,
  ITripSummary,
  IStoppage,
  IIdling,
  IOverspeedSegment,
} from "../../../models/tripModel";

export interface ITripCalculationResult {
  summary: ITripSummary;
  stoppages: IStoppage[];
  idlings: IIdling[];
  overspeedSegments: IOverspeedSegment[];
  gpsPointsWithSpeed: IGPSPoint[];
}

export interface ITripCalculationService {
  calculateTripMetrics(gpsPoints: IGPSPoint[]): ITripCalculationResult;
  calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number;
  calculateSpeed(point1: IGPSPoint, point2: IGPSPoint): number;
}