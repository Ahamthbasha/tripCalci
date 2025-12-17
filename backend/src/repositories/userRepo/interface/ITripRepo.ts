import { ITrip } from "../../../models/tripModel";
import { IGenericRepo } from "../../genericRepo/interface/IGenericRepo";

export interface ITripRepo extends IGenericRepo<ITrip> {
  findByUserId(userId: string): Promise<ITrip[]>;
  findByIdAndUserId(tripId: string, userId: string): Promise<ITrip | null>;
  findMultipleByIdsAndUserId(
    tripIds: string[],
    userId: string
  ): Promise<ITrip[]>;
  updateTripCalculations(tripId: string, data: Partial<ITrip>): Promise<ITrip | null>;
  deleteAllByUserId(userId: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}