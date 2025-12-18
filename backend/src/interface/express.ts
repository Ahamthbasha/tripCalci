import { Request } from "express";
import { IJwtPayload } from "../services/commonService/interface/IJwtServie";

export interface AuthenticatedRequest extends Request {
  user?: IJwtPayload;
}