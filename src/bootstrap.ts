import express, { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import chalk from 'chalk';
import morgan from "morgan"
import { connectDB } from './DB/mongoose.connection.js';
import { IError } from './utils/error/error_handle.js';

 const app = express();


export const bootstrap = async () => {

app.use(express.json());
app.use(morgan("dev")); 
await connectDB()

const errorHandler: ErrorRequestHandler = (err: IError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode).json({ 
    message: err.message,
    status:err.statusCode ,
    stack:err.stack
   });
};

app.use(errorHandler);




app.listen (process.env.PORT, () => {
    console.log(chalk.blue(`Server is running on port ${process.env.PORT}`));
  })

};