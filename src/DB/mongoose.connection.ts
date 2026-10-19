import mongoose from "mongoose";
import chalk from "chalk"

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log(chalk.blue("database connected successfully"));
  } catch (error) {
    console.log(chalk.red("error connecting to database"), error);
    throw error;
  }
};