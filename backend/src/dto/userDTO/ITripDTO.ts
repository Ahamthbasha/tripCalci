// services/userServie/interface/ITripDTO.ts

// ==================== GPS POINT DTO ====================
export interface IGPSPointDTO {
  latitude: number;
  longitude: number;
  timestamp: string;
  ignition: 'on' | 'off';
  speed: number;
  eventType?: 'normal' | 'stopped' | 'idling' | 'overspeeding';
}

// ==================== PATH SEGMENT DTO ====================
export interface IPathSegmentDTO {
  points: Array<{
    latitude: number;
    longitude: number;
  }>;
  color: string; // 'blue' | 'cyan' | 'magenta'
  type: 'normal' | 'overspeeding';
  startTime: string;
  endTime: string;
  maxSpeed?: number;
}

// ==================== MARKER DTO ====================
export interface IMarkerDTO {
  type: 'start' | 'end' | 'stoppage' | 'idling';
  location: {
    latitude: number;
    longitude: number;
  };
  label: string;
  duration?: number; // in seconds
  startTime?: string;
  endTime?: string;
  color: string; // 'red' | 'blue' | 'magenta'
}

// ==================== TABLE ROW DTO ====================
export interface ITableRowDTO {
  timeRange: string; // "11:30:24 PM to 11:40:24 PM"
  point: string; // "40.7128° N, 74.0060° W"
  ignition: 'ON' | 'OFF';
  speed: string; // "28.5 KM/H"
  summary: {
    travelDuration?: string;
    stoppedFrom?: string;
    distance?: string;
    overspeedingDuration?: string;
    idlingDuration?: string;
  };
}

// ==================== SUMMARY DTO ====================
export interface ITripSummaryDTO {
  totalDistanceTravelled: string; // "63 KM"
  totalTravelledDuration: string; // "1Hr 36 Mins"
  overspeedingDuration: string; // "41 Mins"
  overspeedingDistance: string; // "20.3 KM"
  stoppedDuration: string; // "41 Mins"
  idlingDuration?: string; // "10 Mins"
}

// ==================== TRIP VISUALIZATION DTO ====================
export interface ITripVisualizationDTO {
  tripId: string;
  tripName: string;
  uploadDate: string;
  
  // Summary Cards
  summary: ITripSummaryDTO;
  
  // Map Data
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
  
  // Table Data (paginated)
  tableData: {
    rows: ITableRowDTO[];
    totalRows: number;
    currentPage: number;
    pageSize: number;
  };
  
  // Raw data (optional, for debugging)
  rawGPSPoints?: IGPSPointDTO[];
}

// ==================== MULTIPLE TRIPS DTO ====================
export interface IMultipleTripsVisualizationDTO {
  trips: Array<{
    tripId: string;
    tripName: string;
    color: string; // Different color for each trip
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