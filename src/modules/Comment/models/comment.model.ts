import mongoose, { HydratedDocument } from "mongoose";
import { BadReuestExecption } from "../../../utils/error/error_handle";
import { IComment } from "../types/comment.types";

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    attachments: [String],
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

commentSchema.virtual("repliesCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
  count: true,
});

// a comment must have text or at least one attachment
commentSchema.pre("validate", function (this: HydratedDocument<IComment>) {
  if (!this.content && !this.attachments?.length) {
    throw new BadReuestExecption("comment must have content or attachments");
  }
});

// deleting comments also deletes their replies (runs recursively down the tree)
commentSchema.pre(
  ["deleteOne", "deleteMany"],
  { document: false, query: true },
  async function () {
    const ids = await this.model.distinct("_id", this.getFilter());
    if (ids.length) {
      await this.model.deleteMany({ parentId: { $in: ids } });
    }
  },
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
