import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/trpc/router';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/trpc',
        fetch(url, options) {
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
