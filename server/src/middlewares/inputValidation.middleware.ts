import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export default function validateInput(schema: ZodSchema<any>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedInput = schema.safeParse(req.body);

    if (!parsedInput.success) {
      return res.status(400).json({
        message: 'Invalid Input',
        err: parsedInput.error,
      });
    }

    req.body = parsedInput.data;
    return next();
  };
}