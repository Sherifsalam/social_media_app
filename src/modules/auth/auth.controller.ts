import { Router, Request, Response, NextFunction } from "express";
import { authservices } from "./auth.service";
import { SuccessResponse } from "../../utils/error/error_handle";
import { Validation } from "../../middleware/validation.middleware.js";
import { confimEmailSchema, signupSchema,LoginSchema,resendConfimEmailSchema } from "./auth.validation"; 
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

const routes = {
  base: "/auth",
  signup: "/signup",
  confirmEmail:"/confirm-email",
  resendConfirmEmailOtp:"/resend-confirm-email-otp",
  login:"/login",
};

router.post(
  routes.signup,
  Validation(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("SIGNUP ROUTE HIT");
    try {
      const user = await authservices.signup(req.body);
      new SuccessResponse(user, "user created successfully", 201).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(routes.confirmEmail,
  Validation(confimEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authservices.ConfirmEmail(req.body);
      new SuccessResponse(null, "email confirmed successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.post(routes.login,
  Validation(LoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authservices.login(req.body);
      const { accessToken, refreshToken } = result.data;
      new SuccessResponse({ accessToken, refreshToken }, "login successful", 200).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  routes.resendConfirmEmailOtp,
  Validation(resendConfimEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authservices.resendOTP(req.body);
      new SuccessResponse(result.data, "otp sent successfully", 200).send(res);
    } catch (err) {
      next(err);
    }
  },
);


router.get("/me",authMiddleware , async (req: Request,
   res: Response,
  next: NextFunction) => {
    const user = req.user
    new SuccessResponse(user, "user data retrieved successfully", 200).send(res);
  })



export default router;
