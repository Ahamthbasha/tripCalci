export interface Login {
    email : string,
    password : string,
    role:string
}

// types/trip.types.ts

// ==================== SUMMARY ====================
export interface TripSummary {
  totalDistance: number;      // in meters
  totalDuration: number;       // in seconds
  stoppageDuration: number;    // in seconds
  idlingDuration: number;      // in seconds
  overspeedCount: number;      // count of overspeed segments
  maxSpeed: number;            // in km/h
  avgSpeed: number;            // in km/h
}

// ==================== GPS POINT ====================
export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  ignition: "on" | "off";
  speed?: number;              // in km/h
}

// ==================== LOCATION ====================
export interface Location {
  latitude: number;
  longitude: number;
}

// ==================== STOPPAGE ====================
export interface Stoppage {
  startTime: Date;
  endTime: Date;
  duration: number;            // in seconds
  location: Location;
}

// ==================== IDLING ====================
export interface Idling {
  startTime: Date;
  endTime: Date;
  duration: number;            // in seconds
  location: Location;
}

// ==================== OVERSPEED SEGMENT ====================
export interface OverspeedSegment {
  startTime: Date;
  endTime: Date;
  startLocation: Location;
  endLocation: Location;
  maxSpeed: number;            // in km/h
}

// ==================== TRIP (List View) ====================
export interface Trip {
  id: string;
  tripName: string;
  uploadDate: Date;
  summary: TripSummary;
}

// ==================== TRIP DETAILS (Full View) ====================
export interface TripDetails {
  _id: string;
  userId: string;
  tripName: string;
  uploadDate: Date;
  gpsPoints: GPSPoint[];
  summary: TripSummary;
  stoppages: Stoppage[];
  idlings: Idling[];
  overspeedSegments: OverspeedSegment[];
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API RESPONSES ====================
export interface UploadTripResponse {
  success: boolean;
  message: string;
  trip?: {
    id: string;
    tripName: string;
    uploadDate: Date;
    summary: TripSummary;
  };
}

export interface GetTripsResponse {
  success: boolean;
  message: string;
  trips?: Trip[];
}

export interface GetTripDetailsResponse {
  success: boolean;
  message: string;
  trip?: TripDetails;
}

export interface DeleteTripResponse {
  success: boolean;
  message: string;
}























// types/trip.ts

export interface IGPSPointDTO {
  latitude: number;
  longitude: number;
  timestamp: string;
  ignition: 'on' | 'off';
  speed: number;
  eventType?: 'normal' | 'stopped' | 'idling' | 'overspeeding';
}

export interface IPathSegmentDTO {
  points: Array<{
    latitude: number;
    longitude: number;
  }>;
  color: string;
  type: 'normal' | 'overspeeding';
  startTime: string;
  endTime: string;
  maxSpeed?: number;
}

export interface IMarkerDTO {
  type: 'start' | 'end' | 'stoppage' | 'idling';
  location: {
    latitude: number;
    longitude: number;
  };
  label: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  color: string;
}

export interface ITableRowDTO {
  timeRange: string;
  point: string;
  ignition: 'ON' | 'OFF';
  speed: string;
  summary: {
    travelDuration?: string;
    stoppedFrom?: string;
    distance?: string;
    overspeedingDuration?: string;
    idlingDuration?: string;
  };
}

export interface ITripSummaryDTO {
  totalDistanceTravelled: string;
  totalTravelledDuration: string;
  overspeedingDuration: string;
  overspeedingDistance: string;
  stoppedDuration: string;
  idlingDuration?: string;
}

export interface ITripVisualizationDTO {
  tripId: string;
  tripName: string;
  uploadDate: string;
  summary: ITripSummaryDTO;
  mapData: {
    center: {
      latitude: number;
      longitude: number;
    };
    zoom: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    pathSegments: IPathSegmentDTO[];
    markers: IMarkerDTO[];
  };
  tableData: {
    rows: ITableRowDTO[];
    totalRows: number;
    currentPage: number;
    pageSize: number;
  };
  rawGPSPoints?: IGPSPointDTO[];
}

export interface IMultipleTripsVisualizationDTO {
  trips: Array<{
    tripId: string;
    tripName: string;
    color: string;
    pathSegments: IPathSegmentDTO[];
    markers: IMarkerDTO[];
    summary: ITripSummaryDTO;
  }>;
  mapBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}