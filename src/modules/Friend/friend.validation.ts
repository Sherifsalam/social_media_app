import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";

export const sendFriendRequestSchema = {
  params: z.object({
    userId: generalFields.id,
  }),
};

export const friendRequestIdSchema = {
  params: z.object({
    requestId: generalFields.id,
  }),
};

export const getFriendRequestsSchema = {
  query: z.object({
    type: z.enum(["received", "sent"]).optional(),
  }),
};

export const friendIdSchema = {
  params: z.object({
    friendId: generalFields.id,
  }),
};

export type SendFriendRequestParams = z.infer<typeof sendFriendRequestSchema.params>;
export type FriendRequestIdParams = z.infer<typeof friendRequestIdSchema.params>;
export type GetFriendRequestsQuery = z.infer<typeof getFriendRequestsSchema.query>;
export type FriendIdParams = z.infer<typeof friendIdSchema.params>;
