import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type ReqKey = "body" | "params" | "query";

export type ValidationSchema = Partial<Record<ReqKey, ZodType>>;

const reqData: ReqKey[] = ["body", "params", "query"];

export const Validation = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validateErrors: unknown[] = [];

    reqData.forEach((key) => {
      if (schema[key]) {
        const result = schema[key]!.safeParse(req[key]);

        if (!result.success) {
          validateErrors.push(result.error.flatten().fieldErrors);
        }
      }
    });

    if (validateErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        errors: validateErrors,
      });
    }

    return next();
  };
};
