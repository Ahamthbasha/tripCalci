import mongoose, { Schema, Document, Types } from "mongoose";

// GPS Point Interface
export interface IGPSPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  ignition: "on" | "off";
  speed?: number; // Calculated speed in km/h
}

// Trip Summary Interface
export interface ITripSummary {
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  stoppageDuration: number; // in seconds
  idlingDuration: number; // in seconds
  overspeedCount: number;
  maxSpeed: number; // in km/h
  avgSpeed: number; // in km/h
}

// Stoppage Interface
export interface IStoppage {
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  location: {
    latitude: number;
    longitude: number;
  };
}

// Idling Interface
export interface IIdling {
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  location: {
    latitude: number;
    longitude: number;
  };
}

// Overspeed Segment Interface
export interface IOverspeedSegment {
  startTime: Date;
  endTime: Date;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
  maxSpeed: number;
}

// Main Trip Interface
export interface ITrip extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tripName: string;
  uploadDate: Date;
  gpsPoints: IGPSPoint[];
  summary: ITripSummary;
  stoppages: IStoppage[];
  idlings: IIdling[];
  overspeedSegments: IOverspeedSegment[];
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GPS Point Schema
const gpsPointSchema = new Schema<IGPSPoint>(
  {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    ignition: {
      type: String,
      enum: ["on", "off"],
      required: true,
    },
    speed: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Trip Summary Schema
const tripSummarySchema = new Schema<ITripSummary>(
  {
    totalDistance: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    stoppageDuration: {
      type: Number,
      default: 0,
    },
    idlingDuration: {
      type: Number,
      default: 0,
    },
    overspeedCount: {
      type: Number,
      default: 0,
    },
    maxSpeed: {
      type: Number,
      default: 0,
    },
    avgSpeed: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Stoppage Schema
const stoppageSchema = new Schema<IStoppage>(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  { _id: false }
);

// Idling Schema
const idlingSchema = new Schema<IIdling>(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  { _id: false }
);

// Overspeed Segment Schema
const overspeedSegmentSchema = new Schema<IOverspeedSegment>(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    startLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    endLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    maxSpeed: { type: Number, required: true },
  },
  { _id: false }
);

// Main Trip Schema
const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tripName: {
      type: String,
      required: true,
      trim: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    gpsPoints: {
      type: [gpsPointSchema],
      required: true,
      validate: {
        validator: function (points: IGPSPoint[]) {
          return points.length > 0;
        },
        message: "Trip must have at least one GPS point",
      },
    },
    summary: {
      type: tripSummarySchema,
      default: () => ({}),
    },
    stoppages: {
      type: [stoppageSchema],
      default: [],
    },
    idlings: {
      type: [idlingSchema],
      default: [],
    },
    overspeedSegments: {
      type: [overspeedSegmentSchema],
      default: [],
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tripSchema.index({ userId: 1, uploadDate: -1 });
tripSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ITrip>("Trip", tripSchema);