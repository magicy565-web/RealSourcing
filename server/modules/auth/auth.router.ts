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
        secure: true, // Vercel 强制 HTTPS
        sameSite: 'none', // 跨域 Cookie 必须
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
        secure: true, // Vercel 强制 HTTPS
        sameSite: 'none', // 跨域 Cookie 必须
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        success: true,
        user: result.user,
        token: result.token
      };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return authService.getMe(ctx.user.id);
  }),
});
