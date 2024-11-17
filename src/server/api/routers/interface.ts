import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { InterfaceSchema } from "~/types/db";

export const interfaceRouter = createTRPCRouter({
  // Get all interfaces
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Implementation here
    return ctx.db.interface.findMany();
  }),

  // Update interface
  update: publicProcedure
    .input(InterfaceSchema.partial().extend({
      eimInterfaceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation here
    }),

  // Sync with DLAS
  syncWithDLAS: publicProcedure.mutation(async ({ ctx }) => {
    // Implementation here
  }),
}); 