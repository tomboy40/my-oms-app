import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { DBInterfaceSchema } from "~/types/interface-schema";
import { TRPCError } from "@trpc/server";

export const interfaceRouter = createTRPCRouter({
  // Get all interfaces
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Implementation here
    return ctx.db.interface.findMany();
  }),

  // Update interface
  update: publicProcedure
    .input(DBInterfaceSchema.partial().extend({
      eimInterfaceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation here
    }),

  // Sync with DLAS
  syncWithDLAS: publicProcedure.mutation(async ({ ctx }) => {
    // Implementation here
  }),

  search: publicProcedure
    .input(
      z.object({
        appId: z.string().min(1, "Application ID is required"),
        searchTerm: z.string().optional(),
        direction: z.enum(["IN", "OUT"]).optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { appId, searchTerm, direction, status } = input;

        const whereClause = {
          OR: [
            { sendAppId: appId },
            { receivedAppId: appId },
          ],
          AND: [
            ...(direction ? [{ direction }] : []),
            ...(status ? [{ interfaceStatus: status }] : []),
            ...(searchTerm
              ? [
                  {
                    OR: [
                      { interfaceName: { contains: searchTerm, mode: "insensitive" } },
                      { eimInterfaceId: { contains: searchTerm, mode: "insensitive" } },
                      { sendAppName: { contains: searchTerm, mode: "insensitive" } },
                      { receivedAppName: { contains: searchTerm, mode: "insensitive" } },
                    ],
                  },
                ]
              : []),
          ],
        };

        const interfaces = await ctx.db.interface.findMany({
          where: whereClause,
          orderBy: [
            { updatedAt: "desc" },
            { interfaceName: "asc" },
          ],
          select: {
            id: true,
            eimInterfaceId: true,
            interfaceName: true,
            direction: true,
            sendAppId: true,
            sendAppName: true,
            receivedAppId: true,
            receivedAppName: true,
            transferType: true,
            frequency: true,
            technology: true,
            pattern: true,
            sla: true,
            priority: true,
            interfaceStatus: true,
            remarks: true,
          },
        });

        return interfaces;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search interfaces",
          cause: error,
        });
      }
    }),
}); 