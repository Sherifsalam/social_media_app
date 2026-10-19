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
import postRouter from "./modules/Post/post.controller";
import friendRouter from "./modules/Friend/friend.controller";

const app = express();


export const bootstrap = async () => {
  app.use(express.json());
  app.use(morgan("dev"));
  app.get("/ping", (req, res) => res.json({ ok: true }));
  await connectDB();
  await redisClient.connect()


  app.use("/auth", authRouter);
  app.use("/post", postRouter);
  app.use("/friend", friendRouter);

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
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  };

  app.use(errorHandler);

  app.listen(Number(process.env.PORT) || 3000, () => {
    console.log(chalk.blue(`Server is running on port ${process.env.PORT}`));
  });
};