export const JwtErrorMsg = {
  JWT_NOT_FOUND: "JWT not found in the cookies",
  INVALID_JWT: "Invalid JWT",
  JWT_EXPIRATION: "15m",
  JWT_REFRESH_EXPIRATION: "7d",
};

export const EnvErrorMsg = {
  CONST_ENV: "",
  JWT_NOT_FOUND: "JWT secret not found in the env",
  JWT_REFRESH_NOT_FOUND: "JWT_REFRESH_SECRET not found in environment variables",
  NOT_FOUND: "Env not found",
  ADMIN_NOT_FOUND: "Environment variables for admin credentials not found",
};


export const AuthErrorMsg = {
  NO_ACCESS_TOKEN:"Access Token not found",
  NO_REFRESH_TOKEN:"Refresh Token not found",
  REFRESH_TOKEN_EXPIRED:"Refresh Token Expired",
  INVALID_ACCESS_TOKEN:"Invalid Access Token",
  NO_TOKEN: "No token provided",
  INVALID_TOKEN: "Invalid or expired token",
  REFRESH_TOKEN_REQUIRED: "Refresh token is required",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
};