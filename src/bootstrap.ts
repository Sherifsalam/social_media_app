import express, {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import chalk from "chalk";
import morgan from "morgan";
import { connectDB } from "./DB/mongoose.connection";
import{redisClient} from "./DB/redis.connection";
import { IError } from "./utils/error/error_handle";
import authRouter from "./modules/auth/auth.controller";

const app = express();


export const bootstrap = async () => {
  app.use(express.json());
  app.use(morgan("dev"));
 
  await connectDB();
  await redisClient.connect()


  app.use("/auth", authRouter);

  const errorHandler: ErrorRequestHandler = (
    err: IError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    console.log("ACTUAL ERROR:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message || "Internal server error",
      status: statusCode,
      stack: err.stack,
    });
  };

  app.use(errorHandler);

  app.listen(process.env.PORT, () => {
    console.log(chalk.blue(`Server is running on port ${process.env.PORT}`));
  });
};