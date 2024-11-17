import { createTRPCRouter } from "~/server/api/trpc";
import { dlasRouter } from "./routers/dlas";

export const appRouter = createTRPCRouter({
  dlas: dlasRouter,
});

export type AppRouter = typeof appRouter;
