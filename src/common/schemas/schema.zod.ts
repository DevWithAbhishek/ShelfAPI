import { z } from 'zod';

export const signup = z.object({
    email: z.email(),
    password: z.string().min(8),
    name: z.string().min(3)
}).required();

export const login = z.object({
    email: z.email(),
    password: z.string().min(8),
}).required();



export type signupDto = z.infer<typeof signup>;
export type loginDto = z.infer<typeof login>;