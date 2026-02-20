import { router, publicProcedure, protectedProcedure } from '../../trpc/trpc';
import { authService } from './auth.service';
import { z } from 'zod';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(['user', 'buyer', 'factory']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await authService.register(input);
      
      // Set cookie
      ctx.res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return result;
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await authService.login(input.email, input.password);
      
      // Set cookie
      ctx.res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return result;
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie('token');
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return authService.getMe(ctx.user.id);
  }),
});
