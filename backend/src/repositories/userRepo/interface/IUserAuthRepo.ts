import { IUser } from "../../../models/userModel";
import { IGenericRepo } from "../../genericRepo/interface/IGenericRepo";

export interface IUserRepo extends IGenericRepo<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  existsByEmail(email: string): Promise<boolean>;
}