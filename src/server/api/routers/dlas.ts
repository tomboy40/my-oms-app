import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { DLASService } from "../services/dlas";
import { type Interface } from "~/types/db";

export const dlasRouter = createTRPCRouter({
  fetchInterfaces: publicProcedure
    .input(z.object({ appId: z.string() }))
    .query(async ({ input }) => {
      const dlasResponse = await DLASService.fetchInterfaces(input.appId);
      
      const interfaces = [
        ...dlasResponse.interface.interface_dlas_logged,
        ...dlasResponse.interface.interface_only_in_eim,
      ];

      return interfaces.map((iface) => ({
        id: DLASService.generateInterfaceId(iface),
        status: iface.Status,
        direction: iface.Direction,
        eimInterfaceId: iface.EIMInterfaceID,
        interfaceName: iface.InterfaceName ?? iface.EIMInterfaceName ?? "",
        sendAppId: iface.SendAppID,
        sendAppName: iface.SendAppName,
        receivedAppId: iface.ReceivedAppID,
        receivedAppName: iface.ReceivedAppName,
        transferType: iface.TransferType,
        frequency: iface.Frequency,
        technology: iface.Technology,
        pattern: iface.Pattern,
      }));
    }),

  searchInterfaces: publicProcedure
    .input(
      z.object({
        appId: z.string().min(1, "Application ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const interfaces = await ctx.db.interface.findMany({
        where: {
          OR: [
            { sendAppId: input.appId },
            { receivedAppId: input.appId }
          ]
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          id: true,
          status: true,
          direction: true,
          eimInterfaceId: true,
          interfaceName: true,
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
          updatedAt: true
        }
      });

      return interfaces;
    }),

  synchronize: publicProcedure
    .input(z.object({ appId: z.string().min(1, "Application ID is required") }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Fetch latest data from DLAS
        const dlasInterfaces = await DLASService.fetchInterfaces(input.appId);
        
        // 2. Get existing interfaces from database
        const existingInterfaces = await ctx.db.interface.findMany({
          where: {
            OR: [
              { sendAppId: input.appId },
              { receivedAppId: input.appId }
            ]
          }
        });

        // 3. Process updates in a transaction
        const result = await ctx.db.$transaction(async (tx) => {
          const updates: Interface[] = [];
          const inserts: Interface[] = [];
          const deactivates: string[] = [];

          // Create lookup map for existing interfaces
          const existingMap = new Map(
            existingInterfaces.map(i => [i.id, i])
          );

          // Process DLAS interfaces
          for (const dlasInterface of dlasInterfaces) {
            const id = DLASService.generateInterfaceId(dlasInterface);
            const existing = existingMap.get(id);

            const interfaceData = {
              id,
              status: dlasInterface.Status ?? "UNKNOWN",
              direction: dlasInterface.Direction as "IN" | "OUT",
              eimInterfaceId: dlasInterface.EIMInterfaceID,
              interfaceName: dlasInterface.InterfaceName ?? dlasInterface.EIMInterfaceName,
              sendAppId: dlasInterface.SendAppID,
              sendAppName: dlasInterface.SendAppName,
              receivedAppId: dlasInterface.ReceivedAppID,
              receivedAppName: dlasInterface.ReceivedAppName,
              transferType: dlasInterface.TransferType,
              frequency: dlasInterface.Frequency,
              technology: dlasInterface.Technology,
              pattern: dlasInterface.Pattern,
              interfaceStatus: "ACTIVE",
            };

            if (existing) {
              updates.push(interfaceData);
              existingMap.delete(id);
            } else {
              inserts.push(interfaceData);
            }
          }

          // Remaining interfaces in existingMap should be deactivated
          deactivates.push(...Array.from(existingMap.keys()));

          // Execute database operations
          const updatePromises = updates.map(data =>
            tx.interface.update({
              where: { id: data.id },
              data
            })
          );

          const insertPromises = inserts.map(data =>
            tx.interface.create({ data })
          );

          const deactivatePromise = deactivates.length > 0
            ? tx.interface.updateMany({
                where: { id: { in: deactivates } },
                data: { interfaceStatus: "INACTIVE" }
              })
            : Promise.resolve();

          await Promise.all([
            ...updatePromises,
            ...insertPromises,
            deactivatePromise
          ]);

          return {
            updated: updates.length,
            inserted: inserts.length,
            deactivated: deactivates.length
          };
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to synchronize with DLAS",
          cause: error
        });
      }
    })
}); 