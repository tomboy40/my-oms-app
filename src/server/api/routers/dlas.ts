import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { DLASService } from "../services/dlas";

export const dlasRouter = createTRPCRouter({
  synchronize: publicProcedure
    .input(z.object({ 
      appId: z.string().min(1, "Application ID is required") 
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Existing synchronization logic...
        const result = await DLASService.synchronize(input.appId, ctx.db);
        
        return {
          status: "success",
          ...result,
          message: "Successfully synchronized with DLAS"
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to synchronize with DLAS",
          cause: error
        });
      }
    }),

  searchInterfaces: publicProcedure
    .input(z.object({
      appId: z.string().min(1, "Application ID is required"),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const interfaces = await ctx.db.interface.findMany({
          where: {
            OR: [
              { sendAppId: input.appId },
              { receivedAppId: input.appId }
            ]
          },
          orderBy: { updatedAt: 'desc' }
        });

        return interfaces;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to fetch DLAS interfaces",
          cause: error
        });
      }
    }),
}); 