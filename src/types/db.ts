import { z } from "zod";

export const DBInterfaceSchema = z.object({
  eimInterfaceId: z.string().nullable(),
  interfaceName: z.string(),
  direction: z.enum(["IN", "OUT"]),
  sendAppId: z.string(),
  sendAppName: z.string(),
  receivedAppId: z.string(),
  receivedAppName: z.string(),
  transferType: z.string(),
  frequency: z.string(),
  technology: z.string(),
  pattern: z.string(),
  // Additional fields
  sla: z.string().optional(),
  priority: z.string().optional(),
  interfaceStatus: z.string(),
  remarks: z.string().nullable(),
});

// Only fields that can be updated
export const InterfaceUpdateSchema = DBInterfaceSchema.pick({
  sla: true,
  priority: true,
  interfaceStatus: true,
  remarks: true,
});

export type DBInterface = z.infer<typeof DBInterfaceSchema>;
export type InterfaceUpdate = z.infer<typeof InterfaceUpdateSchema>; 