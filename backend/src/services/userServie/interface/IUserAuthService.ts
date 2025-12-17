import { IAuthResponse, ILoginRequest } from "../../../interface/IUserAuth";

export interface IUserService {
  login(data: ILoginRequest): Promise<IAuthResponse>;
}