import mongoose, { HydratedDocument } from "mongoose";
import { BadReuestExecption } from "../../../utils/error/error_handle";
import { Comment } from "../../Comment/models/comment.model";
import { AvailabilityEnum, IPost } from "../types/post.types";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    attachments: [String],
    availability: {
      type: Number,
      enum: [
        AvailabilityEnum.public,
        AvailabilityEnum.friends,
        AvailabilityEnum.onlyMe,
      ],
      default: AvailabilityEnum.public,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

postSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true,
});

// a post must have text or at least one attachment
postSchema.pre("validate", function (this: HydratedDocument<IPost>) {
  if (!this.content && !this.attachments?.length) {
    throw new BadReuestExecption("post must have content or attachments");
  }
});

// deleting posts also deletes all of their comments and replies
postSchema.pre(
  ["deleteOne", "deleteMany"],
  { document: false, query: true },
  async function () {
    const ids = await this.model.distinct("_id", this.getFilter());
    if (ids.length) {
      await Comment.deleteMany({ postId: { $in: ids } });
    }
  },
);

export const Post = mongoose.model<IPost>("Post", postSchema);
