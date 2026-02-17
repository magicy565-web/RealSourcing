import { trpc } from "./lib/trpc";
import { UNAUTHED_ERR_MSG } from '../../shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    // Only log non-transform errors to reduce console noise
    if (error instanceof TRPCClientError && !error.message.includes('Unable to transform')) {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    // Only log non-transform errors to reduce console noise
    if (error instanceof TRPCClientError && !error.message.includes('Unable to transform')) {
      console.error("[API Mutation Error]", error);
    }
  }
});

// Dynamic API URL detection:
// 1. Use VITE_API_URL if provided by build tool
// 2. If on Vercel, default to our ECS server IP
// 3. Otherwise fallback to relative path
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("vercel.app") || hostname.includes("cnsubscribe.xyz")) {
      return "http://47.99.205.136/api/trpc";
    }
  }
  
  return "/api/trpc";
};

const apiUrl = getApiUrl();
console.log("[API Config] Detected URL:", apiUrl);

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
