import { z } from "zod";
import { GenderEnum } from "../User/types/user.types";

export const signupSchema = {
  body: z
    .object({
      username: z.string().min(3).max(30),
      email: z.email(),
      password: z.string().min(8).max(150),
      confirmPassword: z.string(),
      age: z.number().min(13),
      phone: z
        .string()
        .regex(/^\+?[1-9]\d{7,14}$/, { message: "Invalid phone number" }),
      gender: z
        .number()
        .refine(
          (value) => Object.values(GenderEnum).includes(value as GenderEnum),
          { message: "Invalid gender value" },
        ),
      bio: z.string().max(300).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

export const LoginSchema = {
  body: z.object({
    email: z.email(),
    password: z.string().min(8).max(150),
  }),
};


export const confimEmailSchema ={
  body : z.strictObject({
    email:z.email(),
    otp:z.string().length(6)
  }),
}

export type SignupInput = z.infer<typeof signupSchema.body>;
export type LoginInput = z.infer<typeof LoginSchema.body>;
export type ConfirmEmailInput = z.infer<typeof confimEmailSchema.body>;
