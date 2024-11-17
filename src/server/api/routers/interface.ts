import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TableStateSchema } from "~/types/table";

export const interfaceRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({
      appId: z.string().min(1, "Application ID is required"),
      tableState: TableStateSchema,
    }))
    .query(async ({ ctx, input }) => {
      const { appId, tableState } = input;
      const skip = (tableState.page - 1) * tableState.pageSize;

      // Simple where clause just for appId
      const whereClause = {
        OR: [
          { sendAppId: appId },
          { receivedAppId: appId }
        ]
      };

      const [total, interfaces] = await Promise.all([
        ctx.db.interface.count({ where: whereClause }),
        ctx.db.interface.findMany({
          where: whereClause,
          skip,
          take: tableState.pageSize,
          orderBy: { [tableState.sortBy]: tableState.sortDirection },
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
        }),
      ]);

      return {
        interfaces,
        pagination: {
          total,
          pageCount: Math.ceil(total / tableState.pageSize),
          page: tableState.page,
        },
      };
    }),
}); 