import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { dlasRouter } from "./routers/dlas";
import { interfaceRouter } from "./routers/interface";

export const appRouter = createTRPCRouter({
  dlas: dlasRouter,
  interface: interfaceRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
