import { createTRPCRouter } from "~/server/api/trpc";
import { interfaceRouter } from "./routers/interface";

export const appRouter = createTRPCRouter({
  interface: interfaceRouter,
});

export type AppRouter = typeof appRouter;
