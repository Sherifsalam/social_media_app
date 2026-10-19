import { Router, Request, Response, NextFunction } from "express";
import { friendServices } from "./friend.service";
import { SuccessResponse } from "../../utils/error/error_handle";
import { Validation } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  FriendIdParams,
  friendIdSchema,
  FriendRequestIdParams,
  friendRequestIdSchema,
  GetFriendRequestsQuery,
  getFriendRequestsSchema,
  SendFriendRequestParams,
  sendFriendRequestSchema,
} from "./friend.validation";

const router = Router();

const routes = {
  base: "/friend",
  friends: "/",
  removeFriend: "/:friendId",
  sendRequest: "/request/:userId",
  requests: "/requests",
  acceptRequest: "/request/:requestId/accept",
  rejectRequest: "/request/:requestId/reject",
};

// every friend route requires a logged in user
router.use(authMiddleware);

router.get(
  routes.friends,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const friends = await friendServices.getFriends(req.user!);
      new SuccessResponse(friends, "friends retrieved successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  routes.requests,
  Validation(getFriendRequestsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requests = await friendServices.getRequests(
        req.user!,
        req.query as GetFriendRequestsQuery,
      );
      new SuccessResponse(
        requests,
        "friend requests retrieved successfully",
        200,
      ).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  routes.sendRequest,
  Validation(sendFriendRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as SendFriendRequestParams;
      const request = await friendServices.sendRequest(req.user!, userId);
      new SuccessResponse(request, "friend request sent successfully", 201).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  routes.acceptRequest,
  Validation(friendRequestIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params as FriendRequestIdParams;
      const request = await friendServices.acceptRequest(requestId, req.user!);
      new SuccessResponse(request, "friend request accepted", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  routes.rejectRequest,
  Validation(friendRequestIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params as FriendRequestIdParams;
      const request = await friendServices.rejectRequest(requestId, req.user!);
      new SuccessResponse(request, "friend request rejected", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  routes.removeFriend,
  Validation(friendIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendId } = req.params as FriendIdParams;
      await friendServices.removeFriend(req.user!, friendId);
      new SuccessResponse(null, "friend removed successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
