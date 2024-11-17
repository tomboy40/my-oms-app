import { z } from "zod";

export const SortDirectionSchema = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof SortDirectionSchema>;

export const TableStateSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1),
  sortBy: z.string(),
  sortDirection: SortDirectionSchema,
});

export type TableState = z.infer<typeof TableStateSchema>;

export const PAGE_SIZES = [10, 25, 50, 100] as const; 