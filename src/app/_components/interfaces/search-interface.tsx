"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { InterfaceTable } from "./interface-table";
import { type TableState } from "~/types/table";

const initialTableState: TableState = {
  page: 1,
  pageSize: 10,
  sortBy: "interfaceName",
  sortDirection: "asc",
};

export function SearchInterface() {
  const [appId, setAppId] = useState("");
  const [tableState, setTableState] = useState<TableState>(initialTableState);

  const utils = api.useUtils();
  
  // Combined query for interfaces with table state
  const {
    data,
    isLoading: isSearching,
    error: searchError
  } = api.interface.search.useQuery(
    { appId, tableState },
    { 
      enabled: Boolean(appId.trim()),
      keepPreviousData: true // Smooth transitions during pagination
    }
  );

  // DLAS sync mutation
  const {
    mutate: syncWithDLAS,
    isLoading: isSyncing
  } = api.dlas.synchronize.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch data
      void utils.interface.search.invalidate();
    },
  });

  const handleSearch = (newAppId: string) => {
    setAppId(newAppId);
    setTableState(initialTableState); // Reset pagination when searching new app
  };

  const isLoading = isSearching || isSyncing;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={appId}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Enter Application ID"
          className="w-full rounded-md border px-4 py-2 text-gray-900"
          disabled={isLoading}
        />
        <button
          onClick={() => syncWithDLAS({ appId })}
          disabled={!appId.trim() || isLoading}
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
        >
          {isSyncing ? "Syncing..." : "Sync DLAS"}
        </button>
      </div>

      {searchError && (
        <div className="text-sm text-red-500">
          {searchError.message}
        </div>
      )}

      {data?.interfaces.length === 0 && (
        <div className="text-sm text-gray-500">
          No interfaces found
        </div>
      )}

      {data && (
        <InterfaceTable
          data={data.interfaces}
          pagination={data.pagination}
          tableState={tableState}
          onTableStateChange={setTableState}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}