import { UserJwtPayload } from "../lib/middleware/verifyUser";

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}

export { };