import type { HydratedDocument } from "mongoose";
import { User } from "../User/models/user.model";
import { FriendRequest } from "../User/models/FriendRequest.model";
import { IUser } from "../User/types/user.types";
import { FriendRequestStatusEnum, IFriendRequest } from "./types/friend.types";
import { GetFriendRequestsQuery } from "./friend.validation";
import {
  BadReuestExecption,
  ConflictExecption,
  NotFoundExecption,
} from "../../utils/error/error_handle";

type UserDocument = HydratedDocument<IUser>;

class FriendServices {
  async sendRequest(
    user: UserDocument,
    userId: string,
  ): Promise<HydratedDocument<IFriendRequest>> {
    if (user._id.equals(userId)) {
      throw new BadReuestExecption("you can't send a friend request to yourself");
    }

    const target = await User.findById(userId).select("_id");
    if (!target) {
      throw new NotFoundExecption("user not found");
    }

    if (user.friends.some((id) => id.equals(target._id))) {
      throw new ConflictExecption("you are already friends");
    }

    const existing = await FriendRequest.findOne({
      status: FriendRequestStatusEnum.pending,
      $or: [
        { from: user._id, to: target._id },
        { from: target._id, to: user._id },
      ],
    });

    if (existing) {
      throw new ConflictExecption(
        existing.from.equals(user._id)
          ? "friend request already sent"
          : "this user already sent you a friend request, accept it instead",
      );
    }

    return FriendRequest.create({ from: user._id, to: target._id });
  }

  async getRequests(user: UserDocument, { type }: GetFriendRequestsQuery) {
    const filter =
      type === "sent"
        ? { from: user._id, status: FriendRequestStatusEnum.pending }
        : { to: user._id, status: FriendRequestStatusEnum.pending };

    return FriendRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("from", "username")
      .populate("to", "username");
  }

  // only the receiver can answer a pending request
  private async getPendingRequest(
    requestId: string,
    user: UserDocument,
  ): Promise<HydratedDocument<IFriendRequest>> {
    const request = await FriendRequest.findOne({
      _id: requestId,
      to: user._id,
      status: FriendRequestStatusEnum.pending,
    });

    if (!request) {
      throw new NotFoundExecption("friend request not found");
    }

    return request;
  }

  // adding both users as friends happens in the FriendRequest post-save hook
  async acceptRequest(requestId: string, user: UserDocument) {
    const request = await this.getPendingRequest(requestId, user);
    request.status = FriendRequestStatusEnum.accepted;
    await request.save();
    return request;
  }

  async rejectRequest(requestId: string, user: UserDocument) {
    const request = await this.getPendingRequest(requestId, user);
    request.status = FriendRequestStatusEnum.rejected;
    await request.save();
    return request;
  }

  async getFriends(user: UserDocument) {
    const result = await User.findById(user._id)
      .select("friends")
      .populate("friends", "username");

    return result?.friends ?? [];
  }

  async removeFriend(user: UserDocument, friendId: string): Promise<void> {
    if (!user.friends.some((id) => id.equals(friendId))) {
      throw new NotFoundExecption("friend not found");
    }

    await Promise.all([
      User.updateOne({ _id: user._id }, { $pull: { friends: friendId } }),
      User.updateOne({ _id: friendId }, { $pull: { friends: user._id } }),
    ]);
  }
}

export const friendServices = new FriendServices();
