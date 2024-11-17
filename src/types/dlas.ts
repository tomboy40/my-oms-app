import { z } from "zod";

export const DLASInterfaceSchema = z.object({
  Status: z.string(),
  Direction: z.enum(["IN", "OUT"]),
  EIMInterfaceID: z.string().nullable(),
  SendAppID: z.string(),
  SendAppName: z.string(),
  ReceivedAppID: z.string(),
  ReceivedAppName: z.string(),
  TransferType: z.string(),
  Frequency: z.string(),
  Technology: z.string(),
  Pattern: z.string(),
}).and(
  z.union([
    z.object({ InterfaceName: z.string(), EIMInterfaceName: z.never() }),
    z.object({ EIMInterfaceName: z.string(), InterfaceName: z.never() })
  ])
);

export const DLASResponseSchema = z.object({
  appid: z.string(),
  dataDate: z.string(),
  interface: z.object({
    interface_dlas_logged: z.array(DLASInterfaceSchema),
    interface_only_in_eim: z.array(DLASInterfaceSchema)
  })
});

export type DLASInterface = z.infer<typeof DLASInterfaceSchema>;
export type DLASResponse = z.infer<typeof DLASResponseSchema>; 