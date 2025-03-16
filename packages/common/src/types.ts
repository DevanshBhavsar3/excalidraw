import { z } from "zod";

export const UserSchema = z.object({
  username: z
    .string()
    .min(5, "Username must contain at least 5 characters.")
    .max(10, "Username must contain at most 10 characters."),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(30, "Passoword must contain at most 30 characters.")
    .refine(
      (x) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[_#@%!&\*\-])[A-Za-z0-9_#@%!&\*\-]{8,30}$/.test(
          x
        ),
      {
        message:
          "Password must atleast contain 1 Uppercase, Lowercase, Number & Special character.",
      }
    ),
});

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(5, "Room name must contain at least 5 characters.")
    .max(20, "Room name must contain at most 20 characters."),
});
