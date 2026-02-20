import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/trpc/router';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  // 生产环境使用 https://api.cnsubscribe.xyz/api/trpc
  // 开发环境使用 http://localhost:3001/api/trpc
  const url = import.meta.env.VITE_API_URL || (
    import.meta.env.MODE === 'production'
      ? 'https://api.cnsubscribe.xyz/api/trpc'
      : 'http://localhost:3001/api/trpc'
  );

  return trpc.createClient({
    links: [
      httpBatchLink({
        url,
        async fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        },
      }),
    ],
    transformer: superjson,
  });
}
