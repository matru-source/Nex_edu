import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { useToast } from "../../../contexts/ToastContext";
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import type { UserRole } from "../../../types";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
}

interface CreateUserProps {
  open: boolean;
  onClose: () => void;
  user?: User;
  isEdit?: boolean;
}

export default function CreateUser({
  open,
  onClose,
  user,
  isEdit = false,
}: CreateUserProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "CONTRIBUTOR" as UserRole,
    phone: "",
    isActive: true,
  });

  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        isActive: user.isActive,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "CONTRIBUTOR",
        phone: "",
        isActive: true,
      });
    }
  }, [user, isEdit, open]);

 const createMutation = useMutation({
   mutationFn: async (data: any) => {
     const payload = { ...data };
     // Remove password handling - it will always be auto-generated
     delete payload.password;
     const res = await api.post(API_ROUTES.ADMIN.CREATE_USER, payload);
     return res.data;
   },
   onSuccess: () => {
     success("User created successfully! Password sent via email.");
     queryClient.invalidateQueries({ queryKey: ["admin-users"] });
     onClose();
   },
   onError: (err: any) => {
     error(err.response?.data?.message || "Failed to create user");
   },
 });

    const updateMutation = useMutation({
      mutationFn: async (data: any) => {
        const payload = { ...data };
        delete payload.password;
        const res = await api.put(
          API_ROUTES.ADMIN.UPDATE_USER(user!.id),
          payload
        );
        return res.data;
      },
      onSuccess: () => {
        success("User updated successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        onClose();
      },
      onError: (err: any) => {
        error(err.response?.data?.message || "Failed to update user");
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      phone: formData.phone || undefined,
    };

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center">
              <UserPlus className="text-[var(--primary)]" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isEdit ? "Edit User" : "Create New User"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "Update user information"
                  : "Add a new user to the system"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 pl-11 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                placeholder="John Doe"
              />
              <UserPlus
                className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]"
                size={20}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 pl-11 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                placeholder="john.doe@example.com"
              />
              <Mail
                className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]"
                size={20}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full px-4 py-3 pl-11 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all appearance-none"
              >
                <option value="CONTRIBUTOR">Contributor</option>
                <option value="MODERATOR">Moderator</option>
                {isEdit && <option value="ADMIN">Admin</option>}
              </select>
              <Shield
                className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none"
                size={20}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 pl-11 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                placeholder="+1 234 567 8900"
              />
              <Phone
                className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]"
                size={20}
              />
            </div>
          </div>

          {/* Active Status (Edit only) */}
          {isEdit && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 accent-[var(--primary)] rounded"
                />
                <span className="text-sm font-semibold text-foreground">
                  Active Account
                </span>
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-8">
                Inactive users cannot log in to the system
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] text-[var(--primary-foreground)] rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Processing..."
                : isEdit
                ? "Update User"
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
