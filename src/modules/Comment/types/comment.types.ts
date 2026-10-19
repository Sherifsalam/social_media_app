import type { Types } from "mongoose";

export interface IComment {
    content?:string | undefined
    attachments?:string[] | undefined
    postId:Types.ObjectId
    parentId?:Types.ObjectId
    createdBy:Types.ObjectId
    likes:Types.ObjectId[]
}
