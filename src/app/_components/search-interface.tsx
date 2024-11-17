"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function SearchInterface() {
  const [appId, setAppId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    data: interfaces,
    isLoading: isSearching,
    refetch: searchInterfaces
  } = api.dlas.searchInterfaces.useQuery(
    { appId },
    { enabled: false }
  );

  const {
    mutate: fetchFromDLAS,
    isLoading: isFetching,
    error: dlasError
  } = api.dlas.fetchInterfaces.useMutation({
    onSuccess: () => {
      void searchInterfaces();
    },
  });

  const handleSearch = () => {
    if (!appId.trim()) {
      setError("Application ID is required");
      return;
    }
    setError(null);
    void searchInterfaces();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          placeholder="Enter Application ID"
          className="w-full rounded-md border px-4 py-2 text-gray-900"
          disabled={isSearching || isFetching}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || isFetching}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
        <button
          onClick={() => fetchFromDLAS({ appId })}
          disabled={isSearching || isFetching}
          className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
        >
          {isFetching ? "Fetching..." : "Fetch from DLAS"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {dlasError && (
        <div className="text-sm text-red-500">
          {dlasError.message}
        </div>
      )}

      {interfaces?.length === 0 && (
        <div className="text-sm text-gray-500">
          No interfaces found
        </div>
      )}

      {interfaces && interfaces.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interfaces.map((iface) => (
            <div
              key={iface.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <h3 className="font-medium">{iface.interfaceName}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>EIM ID: {iface.eimInterfaceId || 'N/A'}</p>
                <p>Direction: {iface.direction}</p>
                <p>Status: {iface.interfaceStatus}</p>
                <p>Technology: {iface.technology}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}