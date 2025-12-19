import {
  ITripVisualizationDTO,
  IPathSegmentDTO,
  IMarkerDTO,
  ITableRowDTO,
  ITripSummaryDTO,
  IGPSPointDTO,
  IMultipleTripsVisualizationDTO,
} from "../../dto/userDTO/ITripDTO";
import { ITrip, IGPSPoint, IIdling, IStoppage, IOverspeedSegment } from "../../models/tripModel";

export class TripDTOMapper {
  private readonly OVERSPEED_THRESHOLD = 60;

  private formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}Hr ${m} Mins`;
    }
    if (m > 0) {
      return `${m} Mins`;
    }
    return `${s} Secs`;
  }

  private formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} KM`;
    }
    return `${meters.toFixed(0)} M`;
  }

  private formatSpeed(kmh: number): string {
    return `${kmh.toFixed(1)} KM/H`;
  }

  private formatCoordinate(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  }

  private formatTimeRange(start: Date, end: Date): string {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };
    return `${formatTime(start)} to ${formatTime(end)}`;
  }

  private calculateBounds(points: IGPSPoint[]) {
    if (points.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }

    const lats = points.map(p => p.latitude);
    const lons = points.map(p => p.longitude);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons),
    };
  }

private generatePathSegments(trip: ITrip): IPathSegmentDTO[] {
  const segments: IPathSegmentDTO[] = [];
  const points = trip.gpsPoints;

  if (points.length < 2) return segments;

  // Create a Set of timestamps that are within overspeed segments
  const overspeedTimestamps = new Set<number>();
  trip.overspeedSegments.forEach(seg => {
    const startTime = new Date(seg.startTime).getTime();
    const endTime = new Date(seg.endTime).getTime();
    
    points.forEach(point => {
      const pointTime = new Date(point.timestamp).getTime();
      if (pointTime >= startTime && pointTime <= endTime) {
        overspeedTimestamps.add(pointTime);
      }
    });
  });

  // Build segments based on whether points are in overspeed ranges
  let currentSegment: IPathSegmentDTO | null = null;
  let currentType: 'normal' | 'overspeeding' = 'normal';

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const pointTime = new Date(point.timestamp).getTime();
    
    // Determine if this point is in an overspeed segment
    const isOverspeeding = overspeedTimestamps.has(pointTime);
    const segmentType = isOverspeeding ? 'overspeeding' : 'normal';

    // Start new segment if type changes or it's the first point
    if (!currentSegment || currentType !== segmentType) {
      // Save previous segment if it exists
      if (currentSegment) {
        segments.push(currentSegment);
      }

      // Start new segment
      currentSegment = {
        points: [{
          latitude: point.latitude,
          longitude: point.longitude,
        }],
        color: segmentType === 'overspeeding' ? 'cyan' : 'blue',
        type: segmentType,
        startTime: point.timestamp.toISOString(),
        endTime: point.timestamp.toISOString(),
        maxSpeed: point.speed || 0,
      };
      currentType = segmentType;
    } else {
      // Continue current segment
      currentSegment.points.push({
        latitude: point.latitude,
        longitude: point.longitude,
      });
      currentSegment.endTime = point.timestamp.toISOString();
      if ((point.speed || 0) > (currentSegment.maxSpeed || 0)) {
        currentSegment.maxSpeed = point.speed || 0;
      }
    }
  }
  
  // Add the last segment
  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

  private generateMarkers(trip: ITrip): IMarkerDTO[] {
    const markers: IMarkerDTO[] = [];
    const points = trip.gpsPoints;

    if (points.length === 0) return markers;

    markers.push({
      type: 'start',
      location: {
        latitude: points[0].latitude,
        longitude: points[0].longitude,
      },
      label: 'Start',
      color: 'red',
    });

    markers.push({
      type: 'end',
      location: {
        latitude: points[points.length - 1].latitude,
        longitude: points[points.length - 1].longitude,
      },
      label: 'End',
      color: 'red',
    });

    trip.stoppages.forEach((stop) => {
      markers.push({
        type: 'stoppage',
        location: stop.location,
        label: `Stopped for ${this.formatDuration(stop.duration)}`,
        duration: stop.duration,
        startTime: stop.startTime.toISOString(),
        endTime: stop.endTime.toISOString(),
        color: 'blue',
      });
    });

    trip.idlings.forEach((idle) => {
      markers.push({
        type: 'idling',
        location: idle.location,
        label: `Idle for ${this.formatDuration(idle.duration)}`,
        duration: idle.duration,
        startTime: idle.startTime.toISOString(),
        endTime: idle.endTime.toISOString(),
        color: 'magenta',
      });
    });

    return markers;
  }

  private generateTableData(
  trip: ITrip,
  page: number = 1,
  pageSize: number = 10
): { rows: ITableRowDTO[]; totalRows: number } {
  const rows: ITableRowDTO[] = [];
  const points = trip.gpsPoints;

  if (points.length === 0) {
    return { rows: [], totalRows: 0 };
  }

  // Create a lookup for overspeed time ranges from stored segments
  const overspeedRanges = trip.overspeedSegments.map(seg => ({
    start: new Date(seg.startTime).getTime(),
    end: new Date(seg.endTime).getTime(),
  }));

  const isInOverspeedSegment = (timestamp: Date): boolean => {
    const time = new Date(timestamp).getTime();
    return overspeedRanges.some(range => time >= range.start && time <= range.end);
  };

  interface EventSegment {
    type: 'travel' | 'stoppage' | 'idling' | 'overspeeding';
    startIndex: number;
    endIndex: number;
    startTime: Date;
    endTime: Date;
    totalDistance: number;
    totalDuration: number;
    location: { latitude: number; longitude: number };
  }

  const segments: EventSegment[] = [];
  let currentSegment: EventSegment | null = null;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const speed = point.speed || 0;

    let eventType: 'travel' | 'stoppage' | 'idling' | 'overspeeding';

    // Priority: stoppage > idling > overspeeding > travel
    if (point.ignition === 'off') {
      eventType = 'stoppage';
    } else if (speed < 0.1) {
      eventType = 'idling';
    } else if (isInOverspeedSegment(point.timestamp)) {
      eventType = 'overspeeding';
    } else {
      eventType = 'travel';
    }

    // Start new segment if type changes
    if (!currentSegment || currentSegment.type !== eventType) {
      if (currentSegment) {
        segments.push(currentSegment);
      }

      currentSegment = {
        type: eventType,
        startIndex: i,
        endIndex: i,
        startTime: point.timestamp,
        endTime: point.timestamp,
        totalDistance: 0,
        totalDuration: 0,
        location: {
          latitude: point.latitude,
          longitude: point.longitude,
        },
      };
    } else {
      // Extend current segment
      currentSegment.endIndex = i;
      currentSegment.endTime = point.timestamp;

      // Accumulate distance only on movement (from previous point)
      if (i > 0) {
        const prevPoint = points[i - 1];
        const distance = this.calculateDistance(
          { latitude: prevPoint.latitude, longitude: prevPoint.longitude },
          { latitude: point.latitude, longitude: point.longitude }
        );
        currentSegment.totalDistance += distance;
      }
    }
  }

  // Push the last segment
  if (currentSegment) {
    segments.push(currentSegment);
  }

  // Calculate total duration for each segment
  segments.forEach(segment => {
    segment.totalDuration =
      (new Date(segment.endTime).getTime() - new Date(segment.startTime).getTime()) / 1000;
  });

  // Generate table rows
  segments.forEach(segment => {
    // Skip zero-duration segments unless they are meaningful (e.g., brief idling/stoppage)
    // Overspeeding segments will always have duration > 0 if they span at least two points
    if (segment.totalDuration === 0 && segment.type !== 'idling' && segment.type !== 'stoppage') {
      return;
    }

    const startPoint = points[segment.startIndex];
    const avgSpeed =
      segment.endIndex > segment.startIndex
        ? points
            .slice(segment.startIndex, segment.endIndex + 1)
            .reduce((sum, p) => sum + (p.speed || 0), 0) /
          (segment.endIndex - segment.startIndex + 1)
        : (startPoint.speed || 0);

    const summary: {
      travelDuration?: string;
      stoppedFrom?: string;
      distance?: string;
      overspeedingDuration?: string;
      idlingDuration?: string;
    } = {};

    switch (segment.type) {
      case 'stoppage':
        summary.stoppedFrom = this.formatDuration(segment.totalDuration);
        break;

      case 'idling':
        summary.idlingDuration = this.formatDuration(segment.totalDuration);
        break;

      case 'overspeeding':
        summary.travelDuration = this.formatDuration(segment.totalDuration);
        summary.distance = this.formatDistance(segment.totalDistance);
        summary.overspeedingDuration = this.formatDuration(segment.totalDuration);
        break;

      case 'travel':
        summary.travelDuration = this.formatDuration(segment.totalDuration);
        summary.distance = this.formatDistance(segment.totalDistance);
        break;
    }

    rows.push({
      timeRange: this.formatTimeRange(segment.startTime, segment.endTime),
      point: this.formatCoordinate(segment.location.latitude, segment.location.longitude),
      ignition: startPoint.ignition.toUpperCase() as 'ON' | 'OFF',
      speed: this.formatSpeed(avgSpeed),
      summary,
    });
  });

  // Pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedRows = rows.slice(start, end);

  return {
    rows: paginatedRows,
    totalRows: rows.length,
  };
}

  private generateSummary(trip: ITrip): ITripSummaryDTO {
    const overspeedDuration = trip.overspeedSegments.reduce((total, seg) => {
      const duration = (new Date(seg.endTime).getTime() - new Date(seg.startTime).getTime()) / 1000;
      return total + duration;
    }, 0);

    let overspeedDistance = 0;
    for (let i = 1; i < trip.gpsPoints.length; i++) {
      const point = trip.gpsPoints[i];
      if ((point.speed || 0) > this.OVERSPEED_THRESHOLD) {
        const prevPoint = trip.gpsPoints[i - 1];
        const dist = this.calculateDistance(
          { latitude: prevPoint.latitude, longitude: prevPoint.longitude },
          { latitude: point.latitude, longitude: point.longitude }
        );
        overspeedDistance += dist;
      }
    }

    return {
      totalDistanceTravelled: this.formatDistance(trip.summary.totalDistance),
      totalTravelledDuration: this.formatDuration(trip.summary.totalDuration),
      overspeedingDuration: this.formatDuration(overspeedDuration),
      overspeedingDistance: this.formatDistance(overspeedDistance),
      stoppedDuration: this.formatDuration(trip.summary.stoppageDuration),
      idlingDuration: this.formatDuration(trip.summary.idlingDuration),
    };
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; 
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  public mapTripToVisualizationDTO(
    trip: ITrip,
    page: number = 1,
    pageSize: number = 10
  ): ITripVisualizationDTO {
    const bounds = this.calculateBounds(trip.gpsPoints);
    const center = {
      latitude: (bounds.north + bounds.south) / 2,
      longitude: (bounds.east + bounds.west) / 2,
    };

    const tableData = this.generateTableData(trip, page, pageSize);

    return {
      tripId: trip._id.toString(),
      tripName: trip.tripName,
      uploadDate: trip.uploadDate.toISOString(),
      summary: this.generateSummary(trip),
      mapData: {
        center,
        zoom: 13,
        bounds,
        pathSegments: this.generatePathSegments(trip),
        markers: this.generateMarkers(trip),
      },
      tableData: {
        rows: tableData.rows,
        totalRows: tableData.totalRows,
        currentPage: page,
        pageSize,
      },
    };
  }

  public mapMultipleTripsToVisualizationDTO(
    trips: ITrip[]
  ): IMultipleTripsVisualizationDTO {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    const allPoints: IGPSPoint[] = [];
    trips.forEach(trip => allPoints.push(...trip.gpsPoints));
    const bounds = this.calculateBounds(allPoints);

    const mappedTrips = trips.map((trip, index) => ({
      tripId: trip._id.toString(),
      tripName: trip.tripName,
      color: colors[index % colors.length],
      pathSegments: this.generatePathSegments(trip).map(seg => ({
        ...seg,
        color: seg.type === 'overspeeding' ? 'cyan' : colors[index % colors.length],
      })),
      markers: this.generateMarkers(trip),
      summary: this.generateSummary(trip),
    }));

    return {
      trips: mappedTrips,
      mapBounds: bounds,
    };
  }
}