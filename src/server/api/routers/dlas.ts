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
        console.log('[DLAS Router] Starting synchronization for appId:', input.appId);
        const result = await DLASService.fetchInterfaces(input.appId);
        
        // Transform and combine interfaces
        const allInterfaces = [
          ...result.interface.interface_dlas_logged,
          ...result.interface.interface_only_in_eim
        ].map(iface => ({
          id: DLASService.generateInterfaceId(iface),
          eimInterfaceId: iface.EIMInterfaceID,
          interfaceName: iface.InterfaceName || iface.EIMInterfaceName || '',
          direction: iface.Direction,
          sendAppId: iface.SendAppID,
          sendAppName: iface.SendAppName,
          receivedAppId: iface.ReceivedAppID,
          receivedAppName: iface.ReceivedAppName,
          transferType: iface.TransferType,
          frequency: iface.Frequency,
          technology: iface.Technology || '',
          pattern: iface.Pattern || '',
          sla: 'TBD',
          priority: 'LOW',
          interfaceStatus: 'ACTIVE',
          status: iface.Status,
          remarks: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Log the first interface for debugging
        console.log('[DLAS Router] First interface example:', allInterfaces[0]);

        // Upsert all interfaces
        await Promise.all(
          allInterfaces.map(iface => 
            ctx.db.interface.upsert({
              where: { id: iface.id },
              create: iface,
              update: {
                ...iface,
                // Preserve existing values for these fields
                sla: undefined,
                priority: undefined,
                remarks: undefined,
              }
            })
          )
        );

        console.log('[DLAS Router] Saved interfaces:', allInterfaces.length);
        
        return {
          status: "success",
          message: `Successfully synchronized ${allInterfaces.length} interfaces with DLAS`
        };
      } catch (error) {
        console.error('[DLAS Router] Sync error:', error);
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