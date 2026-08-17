import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  type IUser,
} from "./types/user.types";

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    gender: {
      type: Number,
      enum: [GenderEnum.male, GenderEnum.female],
      required: true,
    },
    provider: {
      type: Number,
      enum: [ProviderEnum.system, ProviderEnum.google],
      default: ProviderEnum.system,
    },
    role: {
      type: Number,
      enum: [RoleEnum.user, RoleEnum.admin],
      default: RoleEnum.user,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    confirmedAt: {
      type: Date,
    },
    changedCredentialsAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
