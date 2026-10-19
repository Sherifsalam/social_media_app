import type { Types } from "mongoose";

export enum AvailabilityEnum {
    public,
    friends,
    onlyMe
}

export interface IPost {
    content?:string | undefined
    attachments?:string[] | undefined
    availability?:AvailabilityEnum | undefined
    createdBy:Types.ObjectId
    likes:Types.ObjectId[]
}
