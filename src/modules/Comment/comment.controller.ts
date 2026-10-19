import { Router, Request, Response, NextFunction } from "express";
import { commentServices } from "./comment.service";
import { SuccessResponse } from "../../utils/error/error_handle";
import { Validation } from "../../middleware/validation.middleware";
import {
  CommentIdParams,
  commentIdSchema,
  CommentPostIdParams,
  createCommentSchema,
  getCommentsSchema,
  getRepliesSchema,
  replyCommentSchema,
  updateCommentSchema,
} from "./comment.validation";

// mounted on /post/:postId/comment, mergeParams exposes :postId here
const router = Router({ mergeParams: true });

const routes = {
  base: "/post/:postId/comment",
  create: "/",
  getAll: "/",
  comment: "/:commentId",
  reply: "/:commentId/reply",
  replies: "/:commentId/replies",
  like: "/:commentId/like",
};

router.post(
  routes.create,
  Validation(createCommentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params as CommentPostIdParams;
      const comment = await commentServices.createComment(
        postId,
        req.user!,
        req.body,
      );
      new SuccessResponse(comment, "comment created successfully", 201).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  routes.getAll,
  Validation(getCommentsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params as CommentPostIdParams;
      const result = await commentServices.getComments(
        postId,
        req.user!,
        req.query,
      );
      new SuccessResponse(result, "comments retrieved successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  routes.reply,
  Validation(replyCommentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId, commentId } = req.params as CommentIdParams;
      const reply = await commentServices.replyToComment(
        postId,
        commentId,
        req.user!,
        req.body,
      );
      new SuccessResponse(reply, "reply created successfully", 201).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  routes.replies,
  Validation(getRepliesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId, commentId } = req.params as CommentIdParams;
      const result = await commentServices.getReplies(
        postId,
        commentId,
        req.user!,
        req.query,
      );
      new SuccessResponse(result, "replies retrieved successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  routes.comment,
  Validation(updateCommentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId, commentId } = req.params as CommentIdParams;
      const comment = await commentServices.updateComment(
        postId,
        commentId,
        req.user!,
        req.body,
      );
      new SuccessResponse(comment, "comment updated successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  routes.comment,
  Validation(commentIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId, commentId } = req.params as CommentIdParams;
      await commentServices.deleteComment(postId, commentId, req.user!);
      new SuccessResponse(null, "comment deleted successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  routes.like,
  Validation(commentIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId, commentId } = req.params as CommentIdParams;
      const result = await commentServices.toggleLike(
        postId,
        commentId,
        req.user!,
      );
      new SuccessResponse(
        result,
        result.liked ? "comment liked" : "comment unliked",
        200,
      ).send(res);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
