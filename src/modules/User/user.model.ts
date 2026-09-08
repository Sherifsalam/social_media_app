import mongoose, { HydratedDocument } from "mongoose";
import { decrypt, encrypt } from "../../utils/security/encryption";
import { GenderEnum, ProviderEnum, RoleEnum, IUser } from "./types/user.types";
import { hash } from "../../utils/security/hashing";

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === ProviderEnum.system;
      },
    },
    age: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: Number,
      enum: [GenderEnum.male, GenderEnum.female],
      required: true,
    },
    bio:{
      type:String,
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
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    validateBeforeSave: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

userSchema.pre("save", async function (this: HydratedDocument<IUser>) {
  // if (this.isModified("password")) {
  //   this.password = await hash(this.password);
  // }
  if (this.isModified("phone")) {
    this.phone = encrypt(this.phone);
  }
});

userSchema.post(
  ["find", "findOne"],
  function (docs: HydratedDocument<IUser> | HydratedDocument<IUser>[]) {
    const list = Array.isArray(docs) ? docs : [docs];
    for (const doc of list) {
      if (doc && doc.phone) {
        doc.phone = decrypt(doc.phone);
      }
    }
  },
);

export const User = mongoose.model<IUser>("User", userSchema);