import { z } from "zod";
import { env } from "~/env";
import { DLASInterfaceSchema, DLASResponseSchema } from "~/types/dlas";
import { TRPCError } from "@trpc/server";

export class DLASService {
  private static baseUrl = env.DLAS_API_URL;

  static async fetchInterfaces(appId: string): Promise<z.infer<typeof DLASResponseSchema>> {
    try {
      const url = `${this.baseUrl}?category=interface&appid=${appId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `DLAS API error: ${response.statusText}`,
        });
      }

      const data = await response.json();
      const parsed = DLASResponseSchema.safeParse(data);

      if (!parsed.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid DLAS API response format",
          cause: parsed.error,
        });
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch interfaces from DLAS",
        cause: error,
      });
    }
  }

  static generateInterfaceId(dlasInterface: z.infer<typeof DLASInterfaceSchema>): string {
    const values = [
      dlasInterface.SendAppID,
      dlasInterface.ReceivedAppID,
      dlasInterface.EIMInterfaceID ?? "",
      dlasInterface.InterfaceName ?? dlasInterface.EIMInterfaceName,
      dlasInterface.TransferType,
      dlasInterface.Frequency,
      dlasInterface.Technology,
      dlasInterface.Pattern,
    ];
    
    const key = values.join("|:|");
    return crypto.createHash("sha256").update(key).digest("hex");
  }
} 