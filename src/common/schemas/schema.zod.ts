import { z } from 'zod';

export const signup = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    name: z.string().min(3),
  })
  .required();

export const login = z
  .object({
    email: z.email(),
    password: z.string().min(8),
  })
  .required();

export const addDocument = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string().min(1)).optional().default([]),
});

export const updateDocument = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string().min(1)).optional().default([]),
});

export type signupDto = z.infer<typeof signup>;
export type loginDto = z.infer<typeof login>;
export type addDocumentDto = z.infer<typeof addDocument>
export type updateDocumentDto = z.infer<typeof updateDocument>