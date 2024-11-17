import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { type AppRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        const heads = new Headers(headers());
        heads.set("x-trpc-source", "rsc");
        return Object.fromEntries(heads);
      },
    }),
  ],
});

export const createContext = cache(async () => {
  return createTRPCContext({
    headers: new Headers(headers()),
  });
});
