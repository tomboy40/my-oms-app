import { z } from "zod";

// Zod schema for validation
export const interfaceSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  
  // DLAS Fields
  status: z.string(),
  type: z.string(),
  direction: z.string().optional(),
  eimInterfaceId: z.string().optional(),
  interfaceName: z.string().optional(),
  sendAppId: z.string().optional(),
  sendAppName: z.string().optional(),
  receivedAppId: z.string().optional(),
  receivedAppName: z.string().optional(),
  transferType: z.string().optional(),
  frequency: z.string().optional(),
  technology: z.string().optional(),
  pattern: z.string().optional(),
  
  // Local Fields
  interfaceStatus: z.enum(["active", "inactive"]).default("active"),
  sla: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Low"),
  remarks: z.string().optional(),
  
  // Audit Fields
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

// TypeScript type derived from Zod schema
export type Interface = z.infer<typeof interfaceSchema>; 