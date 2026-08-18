import { config } from "@/config";
import { UserJwtPayload } from "@/types";
import jwt from "jsonwebtoken";

export const generateJwt = (
  payload: UserJwtPayload, 
  options: jwt.SignOptions = { expiresIn: '200h' }
): string => {
  return jwt.sign(payload, config.auth.jwtSecret, options);
};