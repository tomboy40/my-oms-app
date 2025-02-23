"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { InterfaceTable } from "./interface-table";
import { InterfaceSkeleton } from "./interface-skeleton";
import { Search, AlertCircle } from "lucide-react";
import { TableState } from "~/types/table";

const initialTableState: TableState = {
  page: 1,
  pageSize: 10,
  sortBy: "interfaceName",
  sortDirection: "asc",
};

export function SearchInterface() {
  const [appId, setAppId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableState, setTableState] = useState<TableState>(initialTableState);

  const utils = api.useUtils();
  
  const {
    data,
    isLoading: isSearching,
    error: searchError
  } = api.interface.search.useQuery(
    { appId: searchQuery, tableState },
    { 
      enabled: Boolean(searchQuery.trim()),
      staleTime: Infinity,
      retry: false
    }
  );
  const { mutate: syncWithDLAS, isLoading: isSyncing } = api.dlas.synchronize.useMutation({
    onSuccess: (result) => {
      toast.success("Sync completed", {
        description: `${result.message}`
      });
      void utils.interface.search.invalidate();
    },
    onError: (error) => {
      toast.error("Sync failed", {
        description: error.message
      });
    }
  });

  const handleSearch = () => {
    setSearchQuery(appId);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="Enter Application ID"
            className="w-full rounded-md border pl-10 pr-4 py-2 text-gray-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!appId.trim() || isSyncing}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Search
        </button>
        <button
          onClick={() => syncWithDLAS({ appId: searchQuery })}
          disabled={!searchQuery.trim() || isSyncing}
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
        >
          {isSyncing ? "Syncing..." : "Sync DLAS"}
        </button>
      </div>

      {isSearching && <InterfaceSkeleton />}

      {!isSearching && searchError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{searchError.message}</div>
            </div>
          </div>
        </div>
      )}

      {!isSearching && !searchError && data?.interfaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No interfaces found</div>
          <p className="text-sm text-gray-400 mt-2">
            Try searching with a different Application ID or sync with DLAS
          </p>
        </div>
      )}
      {data && data.interfaces.length > 0 && (
        <InterfaceTable
          data={data.interfaces}
          page={tableState.page}
          pageSize={tableState.pageSize}
          sortBy={tableState.sortBy} 
          sortDirection={tableState.sortDirection}
          onStateChange={setTableState}
        />
      )}
    </div>
  );
}