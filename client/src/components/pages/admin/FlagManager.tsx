import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { useToast } from "../../../contexts/ToastContext";
import Modal from "../../lazy/Modal";
import { Tag, X } from "lucide-react";

interface FlagManagerProps {
  entityId: string;
  entityType: "COURSE" | "CHAPTER" | "LESSON";
  currentFlags: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const flagOptions = [
  {
    value: "FREE",
    label: "Free",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  },
  {
    value: "PAID",
    label: "Paid",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  {
    value: "DEMO",
    label: "Demo",
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  },
  {
    value: "COMING_SOON",
    label: "Coming Soon",
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  },
  {
    value: "FREE_TRIAL",
    label: "Free Trial",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  },
  {
    value: "ON_DEMAND",
    label: "On Demand",
    color:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  },
];

export default function FlagManager({
  entityId,
  entityType,
  currentFlags,
  isOpen,
  onClose,
  onSuccess,
}: FlagManagerProps) {
  const [selectedFlags, setSelectedFlags] = useState<string[]>(
    currentFlags || []
  );
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (flags: string[]) => {
      let endpoint;
      if (entityType === "COURSE") {
        endpoint = API_ROUTES.WORKFLOW.UPDATE_COURSE_FLAGS(entityId);
      } else if (entityType === "CHAPTER") {
        endpoint = API_ROUTES.WORKFLOW.UPDATE_CHAPTER_FLAGS(entityId);
      } else {
        endpoint = API_ROUTES.WORKFLOW.UPDATE_LESSON_FLAGS(entityId);
      }
      const res = await api.put(endpoint, { flags });
      return res.data;
    },
    onSuccess: () => {
      success("Flags updated successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to update flags");
    },
  });

  const handleToggleFlag = (flag: string) => {
    if (selectedFlags.includes(flag)) {
      setSelectedFlags(selectedFlags.filter((f) => f !== flag));
    } else {
      setSelectedFlags([...selectedFlags, flag]);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(selectedFlags);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            Manage {entityType} Flags
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Select one or more flags to categorize this{" "}
            {entityType.toLowerCase()}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {flagOptions.map((flag) => {
              const isSelected = selectedFlags.includes(flag.value);
              return (
                <button
                  key={flag.value}
                  onClick={() => handleToggleFlag(flag.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `${flag.color} border-[var(--primary)]`
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm font-medium">{flag.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedFlags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                Selected Flags:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedFlags.map((flag) => {
                  const flagOption = flagOptions.find((f) => f.value === flag);
                  return (
                    <span
                      key={flag}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        flagOption?.color || ""
                      }`}
                    >
                      {flagOption?.label || flag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Saving..." : "Save Flags"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
