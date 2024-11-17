import { z } from "zod";
import { env } from "~/env";
import { DLASInterfaceSchema, DLASResponseSchema } from "~/types/dlas";
import { TRPCError } from "@trpc/server";

export class DLASService {
  private static baseUrl = env.DLAS_API_URL;

  static async fetchInterfaces(appId: string): Promise<z.infer<typeof DLASResponseSchema>> {
    try {
      const url = `${this.baseUrl}?category=interface&appid=${appId}`;
      console.log('[DLAS] Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('[DLAS] Response status:', response.status);
      
      if (!response.ok) {
        console.error('[DLAS] Response not OK:', response.statusText);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `DLAS API error: ${response.statusText}`,
        });
      }

      const data = await response.json();
      console.log('[DLAS] Raw response:', JSON.stringify(data, null, 2));
      
      const parsed = DLASResponseSchema.safeParse(data);
      if (!parsed.success) {
        console.error('[DLAS] Schema validation errors:', parsed.error.errors);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid DLAS API response format",
          cause: parsed.error,
        });
      }

      return parsed.data;
    } catch (error) {
      console.error('[DLAS] Error details:', error);
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch interfaces from DLAS",
        cause: error,
      });
    }
  }

  static generateInterfaceId(dlasInterface: z.infer<typeof DLASInterfaceSchema>): string {
    const interfaceName = dlasInterface.InterfaceName || dlasInterface.EIMInterfaceName || '';
    const values = [
      dlasInterface.SendAppID,
      dlasInterface.ReceivedAppID,
      dlasInterface.EIMInterfaceID ?? "",
      interfaceName,
      dlasInterface.TransferType,
      dlasInterface.Frequency,
      dlasInterface.Technology,
      dlasInterface.Pattern,
    ];
    
    const key = values.join("|:|");
    return require('crypto').createHash("sha256").update(key).digest("hex");
  }
} 