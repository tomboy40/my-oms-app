import { createTRPCRouter } from "~/server/api/trpc";
import { dlasRouter } from "./routers/dlas";
import { interfaceRouter } from "./routers/interface";

export const appRouter = createTRPCRouter({
  dlas: dlasRouter,
  interface: interfaceRouter,
});

export type AppRouter = typeof appRouter;
