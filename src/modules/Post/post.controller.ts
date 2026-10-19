import { Router, Request, Response, NextFunction } from "express";
import { postServices } from "./post.service";
import { SuccessResponse } from "../../utils/error/error_handle";
import { Validation } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createPostSchema,
  getPostsSchema,
  postIdSchema,
  PostIdParams,
  updatePostSchema,
} from "./post.validation";
import commentRouter from "../Comment/comment.controller";

const router = Router();

const routes = {
  base: "/post",
  create: "/",
  getAll: "/",
  post: "/:postId",
  like: "/:postId/like",
  comment: "/:postId/comment",
};

// every post route requires a logged in user
router.use(authMiddleware);

router.use(routes.comment, commentRouter);

router.post(
  routes.create,
  Validation(createPostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await postServices.createPost(req.user!, req.body);
      new SuccessResponse(post, "post created successfully", 201).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  routes.getAll,
  Validation(getPostsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postServices.getPosts(req.user!, req.query);
      new SuccessResponse(result, "posts retrieved successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  routes.post,
  Validation(postIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params as PostIdParams;
      const post = await postServices.getPost(postId, req.user!);
      new SuccessResponse(post, "post retrieved successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  routes.post,
  Validation(updatePostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params as PostIdParams;
      const post = await postServices.updatePost(postId, req.user!, req.body);
      new SuccessResponse(post, "post updated successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  routes.post,
  Validation(postIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params as PostIdParams;
      await postServices.deletePost(postId, req.user!);
      new SuccessResponse(null, "post deleted successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  routes.like,
  Validation(postIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params as PostIdParams;
      const result = await postServices.toggleLike(postId, req.user!);
      new SuccessResponse(
        result,
        result.liked ? "post liked" : "post unliked",
        200,
      ).send(res);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
