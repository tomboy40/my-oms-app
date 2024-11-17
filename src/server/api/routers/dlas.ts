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
}); 