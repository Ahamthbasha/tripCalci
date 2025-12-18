import { GenericRepo } from "../genericRepo/genericRepo";
import { ITripRepo } from "./interface/ITripRepo";
import Trip, { ITrip } from "../../models/tripModel";
import mongoose from "mongoose";

export class TripRepo extends GenericRepo<ITrip> implements ITripRepo {
  constructor() {
    super(Trip);
  }

  async findByUserId(userId: string): Promise<ITrip[]> {
    return await Trip.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByIdAndUserId(
    tripId: string,
    userId: string
  ): Promise<ITrip | null> {
    return await Trip.findOne({
      _id: new mongoose.Types.ObjectId(tripId),
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  }

  async findMultipleByIdsAndUserId(
    tripIds: string[],
    userId: string
  ): Promise<ITrip[]> {
    const objectIds = tripIds.map((id) => new mongoose.Types.ObjectId(id));

    return await Trip.find({
      _id: { $in: objectIds },
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateTripCalculations(
    tripId: string,
    data: Partial<ITrip>
  ): Promise<ITrip | null> {
    return await Trip.findByIdAndUpdate(
      tripId,
      {
        $set: {
          summary: data.summary,
          stoppages: data.stoppages,
          idlings: data.idlings,
          overspeedSegments: data.overspeedSegments,
          isProcessed: true,
        },
      },
      { new: true }
    ).exec();
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await Trip.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();

    return result.deletedCount || 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return await Trip.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  }

  async findPaginatedByUserId(
  userId: string,
  page: number,
  limit: number
): Promise<ITrip[]> {
  const skip = (page - 1) * limit;
  return await Trip.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
}
}