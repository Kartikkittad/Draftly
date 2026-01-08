import { z } from "zod";

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updateTemplateSchema = z.object({
  name: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  htmlBody: z.string().nullable().optional(),
  editorJson: z.any().nullable().optional(),
  fromEmailUsername: z.string().nullable().optional(),
});
