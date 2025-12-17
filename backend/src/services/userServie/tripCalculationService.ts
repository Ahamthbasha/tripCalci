import * as geolib from "geolib";
import {
  ITripCalculationService,
  ITripCalculationResult,
} from "./interface/ITripCalculationService";
import {
  IGPSPoint,
  ITripSummary,
  IStoppage,
  IIdling,
  IOverspeedSegment,
} from "../../models/tripModel";

export class TripCalculationService implements ITripCalculationService {
  private readonly OVERSPEED_THRESHOLD = 60; // km/h

  calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    return geolib.getDistance(
      { latitude: point1.latitude, longitude: point1.longitude },
      { latitude: point2.latitude, longitude: point2.longitude }
    );
  }

  calculateSpeed(point1: IGPSPoint, point2: IGPSPoint): number {
    const distance = this.calculateDistance(point1, point2); // meters
    const timeDiff =
      (new Date(point2.timestamp).getTime() -
        new Date(point1.timestamp).getTime()) /
      1000; // seconds

    if (timeDiff === 0) return 0;

    const speedMps = distance / timeDiff; // meters per second
    const speedKmh = speedMps * 3.6; // convert to km/h

    return Math.round(speedKmh * 100) / 100; // round to 2 decimal places
  }

  calculateTripMetrics(gpsPoints: IGPSPoint[]): ITripCalculationResult {
    if (gpsPoints.length < 2) {
      return this.getEmptyResult(gpsPoints);
    }

    // Sort GPS points by timestamp
    const sortedPoints = [...gpsPoints].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate speeds and distances
    const pointsWithSpeed = this.calculateSpeeds(sortedPoints);

    // Calculate total distance and duration
    const { totalDistance, totalDuration } =
      this.calculateDistanceAndDuration(pointsWithSpeed);

    // Detect stoppages
    const stoppages = this.detectStoppages(pointsWithSpeed);

    // Detect idlings
    const idlings = this.detectIdlings(pointsWithSpeed);

    // Detect overspeed segments
    const overspeedSegments = this.detectOverspeedSegments(pointsWithSpeed);

    // Calculate summary
    const summary = this.calculateSummary(
      totalDistance,
      totalDuration,
      stoppages,
      idlings,
      overspeedSegments,
      pointsWithSpeed
    );

    return {
      summary,
      stoppages,
      idlings,
      overspeedSegments,
      gpsPointsWithSpeed: pointsWithSpeed,
    };
  }

  private calculateSpeeds(points: IGPSPoint[]): IGPSPoint[] {
    const result: IGPSPoint[] = [];

    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        result.push({ ...points[i], speed: 0 });
      } else {
        const speed = this.calculateSpeed(points[i - 1], points[i]);
        result.push({ ...points[i], speed });
      }
    }

    return result;
  }

  private calculateDistanceAndDuration(
    points: IGPSPoint[]
  ): { totalDistance: number; totalDuration: number } {
    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
      totalDistance += this.calculateDistance(points[i - 1], points[i]);
    }

    const totalDuration =
      (new Date(points[points.length - 1].timestamp).getTime() -
        new Date(points[0].timestamp).getTime()) /
      1000;

    return { totalDistance, totalDuration };
  }

  private detectStoppages(points: IGPSPoint[]): IStoppage[] {
    const stoppages: IStoppage[] = [];
    let stoppageStart: IGPSPoint | null = null;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];

      // Stoppage starts when ignition turns off
      if (prev.ignition === "on" && current.ignition === "off") {
        stoppageStart = current;
      }

      // Stoppage ends when ignition turns on
      if (prev.ignition === "off" && current.ignition === "on" && stoppageStart) {
        const duration =
          (new Date(prev.timestamp).getTime() -
            new Date(stoppageStart.timestamp).getTime()) /
          1000;

        stoppages.push({
          startTime: stoppageStart.timestamp,
          endTime: prev.timestamp,
          duration,
          location: {
            latitude: stoppageStart.latitude,
            longitude: stoppageStart.longitude,
          },
        });

        stoppageStart = null;
      }
    }

    // Handle case where stoppage continues till the end
    if (stoppageStart && points.length > 0) {
      const lastPoint = points[points.length - 1];
      const duration =
        (new Date(lastPoint.timestamp).getTime() -
          new Date(stoppageStart.timestamp).getTime()) /
        1000;

      stoppages.push({
        startTime: stoppageStart.timestamp,
        endTime: lastPoint.timestamp,
        duration,
        location: {
          latitude: stoppageStart.latitude,
          longitude: stoppageStart.longitude,
        },
      });
    }

    return stoppages;
  }

  private detectIdlings(points: IGPSPoint[]): IIdling[] {
    const idlings: IIdling[] = [];
    let idlingStart: IGPSPoint | null = null;

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const speed = current.speed || 0;

      // Idling starts when ignition is on and speed is 0
      if (current.ignition === "on" && speed === 0 && !idlingStart) {
        idlingStart = current;
      }

      // Idling ends when speed becomes > 0 or ignition turns off
      if (idlingStart && (speed > 0 || current.ignition === "off")) {
        const duration =
          (new Date(points[i - 1].timestamp).getTime() -
            new Date(idlingStart.timestamp).getTime()) /
          1000;

        if (duration > 0) {
          idlings.push({
            startTime: idlingStart.timestamp,
            endTime: points[i - 1].timestamp,
            duration,
            location: {
              latitude: idlingStart.latitude,
              longitude: idlingStart.longitude,
            },
          });
        }

        idlingStart = null;
      }
    }

    // Handle case where idling continues till the end
    if (idlingStart && points.length > 0) {
      const lastPoint = points[points.length - 1];
      const duration =
        (new Date(lastPoint.timestamp).getTime() -
          new Date(idlingStart.timestamp).getTime()) /
        1000;

      if (duration > 0) {
        idlings.push({
          startTime: idlingStart.timestamp,
          endTime: lastPoint.timestamp,
          duration,
          location: {
            latitude: idlingStart.latitude,
            longitude: idlingStart.longitude,
          },
        });
      }
    }

    return idlings;
  }

  private detectOverspeedSegments(points: IGPSPoint[]): IOverspeedSegment[] {
    const segments: IOverspeedSegment[] = [];
    let segmentStart: IGPSPoint | null = null;
    let maxSpeedInSegment = 0;

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const speed = current.speed || 0;

      // Overspeed segment starts
      if (speed > this.OVERSPEED_THRESHOLD && !segmentStart) {
        segmentStart = current;
        maxSpeedInSegment = speed;
      }

      // Track max speed in segment
      if (segmentStart && speed > maxSpeedInSegment) {
        maxSpeedInSegment = speed;
      }

      // Overspeed segment ends
      if (segmentStart && speed <= this.OVERSPEED_THRESHOLD) {
        segments.push({
          startTime: segmentStart.timestamp,
          endTime: points[i - 1].timestamp,
          startLocation: {
            latitude: segmentStart.latitude,
            longitude: segmentStart.longitude,
          },
          endLocation: {
            latitude: points[i - 1].latitude,
            longitude: points[i - 1].longitude,
          },
          maxSpeed: maxSpeedInSegment,
        });

        segmentStart = null;
        maxSpeedInSegment = 0;
      }
    }

    // Handle case where overspeed continues till the end
    if (segmentStart && points.length > 0) {
      const lastPoint = points[points.length - 1];
      segments.push({
        startTime: segmentStart.timestamp,
        endTime: lastPoint.timestamp,
        startLocation: {
          latitude: segmentStart.latitude,
          longitude: segmentStart.longitude,
        },
        endLocation: {
          latitude: lastPoint.latitude,
          longitude: lastPoint.longitude,
        },
        maxSpeed: maxSpeedInSegment,
      });
    }

    return segments;
  }

  private calculateSummary(
    totalDistance: number,
    totalDuration: number,
    stoppages: IStoppage[],
    idlings: IIdling[],
    overspeedSegments: IOverspeedSegment[],
    points: IGPSPoint[]
  ): ITripSummary {
    const stoppageDuration = stoppages.reduce(
      (sum, stop) => sum + stop.duration,
      0
    );
    const idlingDuration = idlings.reduce((sum, idle) => sum + idle.duration, 0);
    const overspeedCount = overspeedSegments.length;

    const speeds = points.map((p) => p.speed || 0).filter((s) => s > 0);
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
    const avgSpeed =
      speeds.length > 0
        ? Math.round(
            (speeds.reduce((sum, s) => sum + s, 0) / speeds.length) * 100
          ) / 100
        : 0;

    return {
      totalDistance: Math.round(totalDistance),
      totalDuration: Math.round(totalDuration),
      stoppageDuration: Math.round(stoppageDuration),
      idlingDuration: Math.round(idlingDuration),
      overspeedCount,
      maxSpeed: Math.round(maxSpeed * 100) / 100,
      avgSpeed,
    };
  }

  private getEmptyResult(gpsPoints: IGPSPoint[]): ITripCalculationResult {
    return {
      summary: {
        totalDistance: 0,
        totalDuration: 0,
        stoppageDuration: 0,
        idlingDuration: 0,
        overspeedCount: 0,
        maxSpeed: 0,
        avgSpeed: 0,
      },
      stoppages: [],
      idlings: [],
      overspeedSegments: [],
      gpsPointsWithSpeed: gpsPoints,
    };
  }
}