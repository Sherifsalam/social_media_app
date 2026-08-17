// import type { NextFunction, Request, Response } from "express";
// import { User } from "../modules/User/user.model";
// import {
//   BadrequestError,
//   NotFoundError,
// } from "../utils/error/error_handle.js";
// import { redisClient } from "../utils/redis/redis.client";
// import { revokeTokenKey } from "../utils/redis/redis.service";
// import { verifyToken, verifyRefreshToken } from "../utils/token/token.js";

// export const TokenType = {
//   access: "access",
//   refresh: "refresh",
// } as const;

// type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType];

// export const decodeToken = async (
//   authorization: string | undefined,
//   tokenType: TokenTypeValue = TokenType.access
// ) => {
//   if (!authorization || !authorization.startsWith("Bearer ")) {
//     throw BadrequestError("in-valid authentication");
//   }

//   const token = authorization.split(" ")[1];

//   if (!token) {
//     throw BadrequestError("in-valid authentication");
//   }

//   const payload =
//     tokenType === TokenType.access
//       ? verifyToken(token)
//       : verifyRefreshToken(token);

//   if (!payload || typeof payload !== "object" || !("_id" in payload)) {
//     throw BadrequestError("invalid token");
//   }

//   const userId = payload._id as string;
//   const jti = payload.jti as string | undefined;

//   if (!jti) {
//     throw BadrequestError("invalid token");
//   }

//   const redisTokenKey = revokeTokenKey(userId, jti);

//   if (!(await redisClient.get(redisTokenKey))) {
//     throw BadrequestError("login again");
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     throw NotFoundError("user not found");
//   }

//   return { user, decodedToken: payload };
// };

// export const authMiddleware = async (
//   req: Request,
//   _res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { user, decodedToken } = await decodeToken(
//       req.headers.authorization,
//       TokenType.access
//     );
//     req.user = user as Request["user"];
//     req.decodedToken = decodedToken as Request["decodedToken"];
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// export const authorization = (roles: number[]) => {
//   return (req: Request, _res: Response, next: NextFunction) => {
//     if (!req.user || !roles.includes(Number(req.user.role))) {
//       return next(
//         BadrequestError("unauthorized - you don't have permission")
//       );
//     }
//     next();
//   };
// };
