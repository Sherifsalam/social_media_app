import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";
import { paginationQuery } from "../../utils/pagination";
import { AvailabilityEnum } from "./types/post.types";

const postFields = {
  content: z.string().trim().min(1).max(5000),
  attachments: z.array(z.url()).max(10),
  availability: z.enum(AvailabilityEnum),
};

const postIdParams = z.object({
  postId: generalFields.id,
});

export const createPostSchema = {
  body: z
    .strictObject({
      content: postFields.content.optional(),
      attachments: postFields.attachments.optional(),
      availability: postFields.availability.optional(),
    })
    .refine((data) => data.content || data.attachments?.length, {
      message: "post must have content or attachments",
      path: ["content"],
    }),
};

export const updatePostSchema = {
  params: postIdParams,
  body: z
    .strictObject({
      content: postFields.content.optional(),
      attachments: postFields.attachments.optional(),
      availability: postFields.availability.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "nothing to update",
    }),
};

export const postIdSchema = {
  params: postIdParams,
};

export const getPostsSchema = {
  query: paginationQuery,
};

export type CreatePostInput = z.infer<typeof createPostSchema.body>;
export type UpdatePostInput = z.infer<typeof updatePostSchema.body>;
export type PostIdParams = z.infer<typeof postIdParams>;
