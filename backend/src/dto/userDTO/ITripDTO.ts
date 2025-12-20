import { ITrip } from "../../models/tripModel";

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

export interface ITripDTOMapper {
  mapTripToVisualizationDTO(
    trip: ITrip,
    page?: number,
    pageSize?: number
  ): ITripVisualizationDTO;

  mapMultipleTripsToVisualizationDTO(
    trips: ITrip[]
  ): IMultipleTripsVisualizationDTO;
}