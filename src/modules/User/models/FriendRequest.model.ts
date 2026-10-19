import mongoose, { HydratedDocument } from "mongoose";
import { BadReuestExecption } from "../../../utils/error/error_handle";
import {
  FriendRequestStatusEnum,
  IFriendRequest,
} from "../../Friend/types/friend.types";
import { User } from "./user.model";

const friendRequestSchema = new mongoose.Schema<IFriendRequest>(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: Number,
      enum: [
        FriendRequestStatusEnum.pending,
        FriendRequestStatusEnum.accepted,
        FriendRequestStatusEnum.rejected,
      ],
      default: FriendRequestStatusEnum.pending,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  },
);

// only one pending request may exist from one user to another
friendRequestSchema.index(
  { from: 1, to: 1 },
  {
    unique: true,
    partialFilterExpression: { status: FriendRequestStatusEnum.pending },
  },
);

friendRequestSchema.pre(
  "validate",
  function (this: HydratedDocument<IFriendRequest>) {
    if (this.from.equals(this.to)) {
      throw new BadReuestExecption("you can't send a friend request to yourself");
    }
  },
);

friendRequestSchema.pre("save", function (this: HydratedDocument<IFriendRequest>) {
  if (this.isModified("status") && this.status !== FriendRequestStatusEnum.pending) {
    this.respondedAt = new Date();
  }
  // remembered for the post-save hook, where isModified() is already reset
  this.$locals.wasAccepted =
    this.isModified("status") && this.status === FriendRequestStatusEnum.accepted;
});

// once a request is accepted, both users become friends
friendRequestSchema.post("save", async function (doc: HydratedDocument<IFriendRequest>) {
  if (!doc.$locals.wasAccepted) return;

  await Promise.all([
    User.updateOne({ _id: doc.from }, { $addToSet: { friends: doc.to } }),
    User.updateOne({ _id: doc.to }, { $addToSet: { friends: doc.from } }),
  ]);
});

export const FriendRequest = mongoose.model<IFriendRequest>(
  "FriendRequest",
  friendRequestSchema,
);
