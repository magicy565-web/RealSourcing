import { router } from './trpc';
import { authRouter } from '../modules/auth/auth.router';
import { webinarRouter } from '../modules/webinar/webinar.router';
import { factoryRouter } from '../modules/factory/factory.router';
import { productRouter } from '../modules/product/product.router';

export const appRouter = router({
  auth: authRouter,
  webinar: webinarRouter,
  factory: factoryRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;
