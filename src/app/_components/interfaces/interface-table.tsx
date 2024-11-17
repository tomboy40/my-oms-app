"use client";

import { type Interface } from "~/types/interfaces";
import { useState } from "react";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { InterfaceDetails } from "./interface-details";

const PAGE_SIZES = [10, 25, 50, 100] as const;

const COLUMNS = [
  { key: "id", label: "Interface ID" },
  { key: "interfaceName", label: "Interface Name" },
  { key: "sendAppId", label: "Send App ID" },
  { key: "sendAppName", label: "Send App Name" },
  { key: "receivedAppId", label: "Receive App ID" },
  { key: "receivedAppName", label: "Receive App Name" },
  { key: "transferType", label: "Transfer Type" },
  { key: "frequency", label: "Frequency" },
  { key: "pattern", label: "Pattern" },
  { key: "technology", label: "Technology" },
  { key: "interfaceStatus", label: "Interface Status" },
  { key: "priority", label: "Priority" },
  { key: "sla", label: "SLA" },
  { key: "remarks", label: "Remarks" },
] as const;

type SortDirection = "asc" | "desc";

interface TableState {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}

interface InterfaceTableProps {
  data: Interface[];
}

export function InterfaceTable({ data }: InterfaceTableProps) {
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    pageSize: 10,
    sortBy: "interfaceName",
    sortDirection: "asc",
  });

  const sortedData = [...data].sort((a, b) => {
    const key = tableState.sortBy as keyof Interface;
    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";
    return tableState.sortDirection === "asc" 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const paginatedData = sortedData.slice(
    (tableState.page - 1) * tableState.pageSize,
    tableState.page * tableState.pageSize
  );

  const totalPages = Math.ceil(data.length / tableState.pageSize);

  const handleSort = (key: string) => {
    setTableState(prev => ({
      ...prev,
      sortBy: key,
      sortDirection: prev.sortBy === key && prev.sortDirection === "asc" ? "desc" : "asc"
    }));
  };

  const handleExportCsv = () => {
    const headers = COLUMNS.map(col => col.label).join(",");
    const rows = sortedData.map(row => 
      COLUMNS.map(col => `"${row[col.key as keyof Interface] ?? ""}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interfaces.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <select
            value={tableState.pageSize}
            onChange={(e) => setTableState(prev => ({
              ...prev,
              pageSize: Number(e.target.value),
              page: 1
            }))}
            className="border rounded p-1"
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm">entries</span>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {tableState.sortBy === col.key && (
                      tableState.sortDirection === "asc" 
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row) => (
              <tr key={row.id}>
              {COLUMNS.map(col => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row[col.key as keyof Interface] ?? "N/A"}
                </td>
              ))}
              <td className="px-6 py-4">
                <InterfaceDetails interface={row} />
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {((tableState.page - 1) * tableState.pageSize) + 1} to{" "}
          {Math.min(tableState.page * tableState.pageSize, data.length)} of{" "}
          {data.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTableState(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={tableState.page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setTableState(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={tableState.page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 