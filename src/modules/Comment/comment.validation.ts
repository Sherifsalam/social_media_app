import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";
import { paginationQuery } from "../../utils/pagination";

const commentFields = {
  content: z.string().trim().min(1).max(2000),
  attachments: z.array(z.url()).max(5),
};

const commentBody = z
  .strictObject({
    content: commentFields.content.optional(),
    attachments: commentFields.attachments.optional(),
  })
  .refine((data) => data.content || data.attachments?.length, {
    message: "comment must have content or attachments",
    path: ["content"],
  });

const postIdParams = z.object({
  postId: generalFields.id,
});

const commentIdParams = z.object({
  postId: generalFields.id,
  commentId: generalFields.id,
});

export const createCommentSchema = {
  params: postIdParams,
  body: commentBody,
};

export const replyCommentSchema = {
  params: commentIdParams,
  body: commentBody,
};

export const updateCommentSchema = {
  params: commentIdParams,
  body: commentBody,
};

export const getCommentsSchema = {
  params: postIdParams,
  query: paginationQuery,
};

export const getRepliesSchema = {
  params: commentIdParams,
  query: paginationQuery,
};

export const commentIdSchema = {
  params: commentIdParams,
};

export type CommentInput = z.infer<typeof commentBody>;
export type CommentPostIdParams = z.infer<typeof postIdParams>;
export type CommentIdParams = z.infer<typeof commentIdParams>;
