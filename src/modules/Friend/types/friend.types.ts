import type { Types } from "mongoose";

export enum FriendRequestStatusEnum {
    pending,
    accepted,
    rejected
}

export interface IFriendRequest {
    from:Types.ObjectId
    to:Types.ObjectId
    status:FriendRequestStatusEnum
    respondedAt?:Date
}
