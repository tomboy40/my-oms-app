"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { Interface } from "~/types/interfaces";

interface InterfaceDetailsProps {
  interface: Interface;
  onUpdate?: (updated: Interface) => void;
}

export function InterfaceDetails({ interface: iface, onUpdate }: InterfaceDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    sla: iface.sla ?? "",
    priority: iface.priority ?? "LOW",
    remarks: iface.remarks ?? "",
  });

  const utils = api.useUtils();
  
  const { mutate: updateDetails } = api.interface.updateDetails.useMutation({
    onMutate: async (newData) => {
      // Cancel outgoing fetches
      await utils.interface.search.cancel();

      // Get current data
      const previousData = utils.interface.search.getData();

      // Optimistically update the interface
      utils.interface.search.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((i) =>
          i.id === iface.id ? { ...i, ...newData } : i
        );
      });

      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.interface.search.setData(undefined, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch after error or success
      void utils.interface.search.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetails({
      id: iface.id,
      ...formData,
    });
    setIsEditing(false);
    onUpdate?.({ ...iface, ...formData });
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">SLA</label>
            <input
              type="text"
              value={formData.sla}
              onChange={(e) => setFormData(prev => ({ ...prev, sla: e.target.value }))}
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="mt-1 block w-full rounded-md border p-2"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="mt-1 block w-full rounded-md border p-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium">{iface.interfaceName}</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Edit
            </button>
          </div>
          
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">SLA</dt>
              <dd className="mt-1">{iface.sla || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Priority</dt>
              <dd className="mt-1">{iface.priority || "N/A"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">Remarks</dt>
              <dd className="mt-1">{iface.remarks || "N/A"}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
} 