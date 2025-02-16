import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const SigninUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const CreateRoom = z.object({
  name: z.string(),
});
