import { IUserRepo } from "../repositories/userRepo/interface/IUserAuthRepo";
import { UserRepo } from "../repositories/userRepo/userAuthRepo";
import { IUserService } from "../services/userServie/interface/IUserAuthService";
import { UserService } from "../services/userServie/userAuthService";
import { IUserController } from "../controllers/userControllers/Interface/IUserAuthController";
import { UserController } from "../controllers/userControllers/userAuthController";

import { IHashService } from "../services/commonService/interface/IHashService";
import { HashService } from "../services/commonService/hashService";

import { IJwtService } from "../services/commonService/interface/IJwtServie";
import { JwtService } from "../services/commonService/jwtService";
import { AuthMiddleware } from "../middlewares/authToken";

const hashService : IHashService = new HashService()
const jwtService : IJwtService = new JwtService()
const authMiddleware = new AuthMiddleware(jwtService)

const userRepo :IUserRepo = new UserRepo()
const userService : IUserService = new UserService(userRepo,hashService,jwtService)
const userController : IUserController = new UserController(userService)

import { ITripRepo } from "../repositories/userRepo/interface/ITripRepo";
import { TripRepo } from "../repositories/userRepo/tripRepo";
import { ITripService } from "../services/userServie/interface/ITripService";
import { TripService } from "../services/userServie/tripService";
import { ITripController } from "../controllers/userControllers/Interface/ITripController";
import { TripController } from "../controllers/userControllers/tripController";
import { ITripCalculationService } from "../services/userServie/interface/ITripCalculationService";
import { TripCalculationService } from "../services/userServie/tripCalculationService";
import { ITripDTOMapper } from "../dto/userDTO/ITripDTO";
import { TripDTOMapper } from "../mapper/userMapper/tripDTOMapper";

const userTripRepo : ITripRepo = new TripRepo()
const userTripCalculationService : ITripCalculationService = new TripCalculationService()
const userTripDtoMapper : ITripDTOMapper = new TripDTOMapper()
const userTripService : ITripService = new TripService(userTripRepo,userTripCalculationService,userTripDtoMapper)
const userTripController : ITripController = new TripController(userTripService)

export {
    userController,
    userTripController,

    authMiddleware
}