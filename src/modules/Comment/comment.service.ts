import type { HydratedDocument } from "mongoose";
import { Comment } from "./models/comment.model";
import { IComment } from "./types/comment.types";
import { IUser } from "../User/types/user.types";
import { CommentInput } from "./comment.validation";
import { postServices } from "../Post/post.service";
import {
  ForbiddenExecption,
  NotFoundExecption,
} from "../../utils/error/error_handle";
import { getPagination } from "../../utils/pagination";

type UserDocument = HydratedDocument<IUser>;

class CommentServices {
  // the user must be able to see the post before touching any of its comments
  private async getComment(
    postId: string,
    commentId: string,
    user: UserDocument,
  ): Promise<HydratedDocument<IComment>> {
    await postServices.getVisiblePost(postId, user);

    const comment = await Comment.findOne({ _id: commentId, postId });

    if (!comment) {
      throw new NotFoundExecption("comment not found");
    }

    return comment;
  }

  private async listComments(
    filter: { postId: string; parentId: string | null },
    query: Record<string, unknown>,
  ) {
    const { page, limit, skip } = getPagination(query);
    const queryFilter = {
      postId: filter.postId,
      parentId: filter.parentId ?? { $exists: false },
    };

    const [comments, total] = await Promise.all([
      Comment.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "username")
        .populate("repliesCount"),
      Comment.countDocuments(queryFilter),
    ]);

    return { comments, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async createComment(
    postId: string,
    user: UserDocument,
    data: CommentInput,
  ): Promise<HydratedDocument<IComment>> {
    const post = await postServices.getVisiblePost(postId, user);
    return Comment.create({ ...data, postId: post._id, createdBy: user._id });
  }

  async replyToComment(
    postId: string,
    commentId: string,
    user: UserDocument,
    data: CommentInput,
  ): Promise<HydratedDocument<IComment>> {
    const parent = await this.getComment(postId, commentId, user);
    return Comment.create({
      ...data,
      postId: parent.postId,
      parentId: parent._id,
      createdBy: user._id,
    });
  }

  async getComments(
    postId: string,
    user: UserDocument,
    query: Record<string, unknown>,
  ) {
    await postServices.getVisiblePost(postId, user);
    return this.listComments({ postId, parentId: null }, query);
  }

  async getReplies(
    postId: string,
    commentId: string,
    user: UserDocument,
    query: Record<string, unknown>,
  ) {
    await this.getComment(postId, commentId, user);
    return this.listComments({ postId, parentId: commentId }, query);
  }

  async updateComment(
    postId: string,
    commentId: string,
    user: UserDocument,
    data: CommentInput,
  ): Promise<HydratedDocument<IComment>> {
    const comment = await this.getComment(postId, commentId, user);

    if (!comment.createdBy.equals(user._id)) {
      throw new ForbiddenExecption("you can only edit your own comments");
    }

    comment.set(data);
    await comment.save();
    return comment;
  }

  // the comment owner or the post owner can delete a comment
  async deleteComment(
    postId: string,
    commentId: string,
    user: UserDocument,
  ): Promise<void> {
    const post = await postServices.getVisiblePost(postId, user);
    const comment = await this.getComment(postId, commentId, user);

    if (!comment.createdBy.equals(user._id) && !post.createdBy.equals(user._id)) {
      throw new ForbiddenExecption("you can't delete this comment");
    }

    await Comment.deleteOne({ _id: comment._id });
  }

  async toggleLike(postId: string, commentId: string, user: UserDocument) {
    const comment = await this.getComment(postId, commentId, user);
    const liked = comment.likes.some((id) => id.equals(user._id));

    const updated = await Comment.findByIdAndUpdate(
      comment._id,
      liked
        ? { $pull: { likes: user._id } }
        : { $addToSet: { likes: user._id } },
      { returnDocument: "after" },
    );

    return { liked: !liked, likesCount: updated?.likes.length ?? 0 };
  }
}

export const commentServices = new CommentServices();
