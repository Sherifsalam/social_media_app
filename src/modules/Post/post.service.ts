import type { HydratedDocument } from "mongoose";
import { Post } from "./models/post.model";
import { AvailabilityEnum, IPost } from "./types/post.types";
import { IUser } from "../User/types/user.types";
import { CreatePostInput, UpdatePostInput } from "./post.validation";
import { NotFoundExecption } from "../../utils/error/error_handle";
import { getPagination } from "../../utils/pagination";

type UserDocument = HydratedDocument<IUser>;

// posts the user is allowed to see: public ones, their own, and friends-only posts of their friends
export const visiblePostsFilter = (user: UserDocument) => ({
  $or: [
    { availability: AvailabilityEnum.public },
    { createdBy: user._id },
    {
      availability: AvailabilityEnum.friends,
      createdBy: { $in: user.friends },
    },
  ],
});

class PostServices {
  async createPost(
    user: UserDocument,
    data: CreatePostInput,
  ): Promise<HydratedDocument<IPost>> {
    return Post.create({ ...data, createdBy: user._id });
  }

  async getPosts(user: UserDocument, query: Record<string, unknown>) {
    const { page, limit, skip } = getPagination(query);
    const filter = visiblePostsFilter(user);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "username")
        .populate("commentsCount"),
      Post.countDocuments(filter),
    ]);

    return { posts, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async getVisiblePost(
    postId: string,
    user: UserDocument,
  ): Promise<HydratedDocument<IPost>> {
    const post = await Post.findOne({ _id: postId, ...visiblePostsFilter(user) });

    if (!post) {
      throw new NotFoundExecption("post not found");
    }

    return post;
  }

  async getPost(postId: string, user: UserDocument) {
    const post = await this.getVisiblePost(postId, user);
    return post.populate([
      { path: "createdBy", select: "username" },
      { path: "commentsCount" },
    ]);
  }

  async updatePost(
    postId: string,
    user: UserDocument,
    data: UpdatePostInput,
  ): Promise<HydratedDocument<IPost>> {
    const post = await Post.findOne({ _id: postId, createdBy: user._id });

    if (!post) {
      throw new NotFoundExecption("post not found");
    }

    post.set(data);
    await post.save();
    return post;
  }

  async deletePost(postId: string, user: UserDocument): Promise<void> {
    const result = await Post.deleteOne({ _id: postId, createdBy: user._id });

    if (!result.deletedCount) {
      throw new NotFoundExecption("post not found");
    }
  }

  async toggleLike(postId: string, user: UserDocument) {
    const post = await this.getVisiblePost(postId, user);
    const liked = post.likes.some((id) => id.equals(user._id));

    const updated = await Post.findByIdAndUpdate(
      post._id,
      liked
        ? { $pull: { likes: user._id } }
        : { $addToSet: { likes: user._id } },
      { returnDocument: "after" },
    );

    return { liked: !liked, likesCount: updated?.likes.length ?? 0 };
  }
}

export const postServices = new PostServices();
