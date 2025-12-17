import { IUserService } from "./interface/IUserAuthService";
import { ILoginRequest, IAuthResponse } from "../../interface/IUserAuth";
import { IUserRepo } from "../../repositories/userRepo/interface/IUserAuthRepo";
import { IHashService } from "../commonService/interface/IHashService";
import { IJwtService } from "../commonService/interface/IJwtServie";

export class UserService implements IUserService {
  private _userRepo: IUserRepo;
  private _hashService: IHashService;
  private _jwtService: IJwtService;

  constructor(
    userRepo: IUserRepo,
    hashService: IHashService,
    jwtService: IJwtService
  ) {
    this._userRepo = userRepo;
    this._hashService = hashService;
    this._jwtService = jwtService;
  }

  async login(data: ILoginRequest): Promise<IAuthResponse> {
    const { email, password } = data;

    // Check if user exists
    const existingUser = await this._userRepo.findByEmail(email);

    // Scenario 1: User doesn't exist - Auto register
    if (!existingUser) {
      const hashedPassword = await this._hashService.hashPassword(password);

      const newUser = await this._userRepo.create({
        email,
        password: hashedPassword,
        role: "user",
      });

      const tokens = await this._jwtService.generateTokens({
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      return {
        success: true,
        message: "Account created and logged in successfully",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
        },
      };
    }

    // Scenario 2: User exists - Verify password
    const isPasswordValid = await this._hashService.comparePassword(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid password",
      };
    }

    // Scenario 3: Valid login - Generate tokens
    const tokens = await this._jwtService.generateTokens({
      id: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role,
    });

    return {
      success: true,
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: existingUser._id.toString(),
        email: existingUser.email,
        role: existingUser.role,
      },
    };
  }
}