import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { DLASService } from "../services/dlas";
import { prisma } from "~/server/db";

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
}); 