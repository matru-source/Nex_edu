import {
  Users,
  Search,
  Filter,
  Table,
  LayoutGrid,
  Pencil,
  Trash2,
  UserPlus,
  Shield,
  UserCheck,
  Mail,
  Phone,
} from "lucide-react";
import TopBar from "../../lazy/TopBar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { TanstackTable } from "../../lazy/TanstackTable";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import type { Response, UserRole } from "../../../types";
import { useToast } from "../../../contexts/ToastContext";
import CreateUser from "./CreateUser";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  profilePhoto: string | null;
}

interface UsersQuery extends Response {
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN:
    "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 dark:text-purple-400",
  MODERATOR:
    "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400",
  CONTRIBUTOR:
    "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400",
  STUDENT:
    "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 dark:text-orange-400",
};

const ROLE_ICONS: Record<UserRole, any> = {
  ADMIN: Shield,
  MODERATOR: UserCheck,
  CONTRIBUTOR: UserPlus,
  STUDENT: Users,
};

export default function AdminUsers() {
  useInitNavStackOnce([{ title: "User Management", path: "/admin/users" }]);
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [isTabularView, setIsTabularView] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [filters, setFilters] = useState({
    role: "" as string,
    isActive: "" as string,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", pagination.page, pagination.limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== "") params.append("isActive", filters.isActive);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const res = await api.get<UsersQuery>(
        `${API_ROUTES.ADMIN.GET_ALL_USERS}?${params.toString()}`
      );
      return res.data;
    },
  });

 const deleteMutation = useMutation({
   mutationFn: async (userId: string) => {
     const res = await api.delete(API_ROUTES.ADMIN.DELETE_USER(userId));
     return res.data;
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["admin-users"] });
     setDeleteUserOpen(false);
     setSelectedUser(null);
     success("User deleted successfully");
   },
   onError: (err: any) => {
     error(err.response?.data?.message || "Failed to delete user");
   },
 });

  const data = useMemo(() => {
    const allUsers = usersQuery.data?.data?.users || [];
    // Exclude STUDENT users - they have their own page
    return allUsers.filter((user) => user.role !== "STUDENT");
  }, [usersQuery.data]);

  const statistics = useMemo(() => {
    const users = data;
    return {
      total: usersQuery.data?.data?.total || 0,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      byRole: {
        ADMIN: users.filter((u) => u.role === "ADMIN").length,
        MODERATOR: users.filter((u) => u.role === "MODERATOR").length,
        CONTRIBUTOR: users.filter((u) => u.role === "CONTRIBUTOR").length,
      },
    };
  }, [data]);

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      const res = await api.put(API_ROUTES.ADMIN.UPDATE_USER(userId), {
        isActive,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      success("User status updated successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.message || "Failed to update user status");
    },
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "#",
        size: 50,
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)]">
            {(pagination.page - 1) * pagination.limit + row.index + 1}
          </div>
        ),
      },
      {
        header: "User",
        size: 200,
        cell: ({ row }) => {
          const user = row.original;
          const RoleIcon = ROLE_ICONS[user.role];
          return (
            <div className="flex items-center gap-3">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center">
                  <RoleIcon className="text-[var(--primary)]" size={20} />
                </div>
              )}
              <div>
                <div className="font-semibold text-[var(--foreground)]">
                  {user.name}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                  <Mail size={12} />
                  {user.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Role",
        accessorKey: "role",
        size: 120,
        cell: ({ row }) => {
          const role = row.original.role;
          const RoleIcon = ROLE_ICONS[role];
          return (
            <div className="flex items-center gap-2">
              <RoleIcon size={16} />
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${ROLE_COLORS[role]}`}
              >
                {role}
              </span>
            </div>
          );
        },
      },
      {
        header: "Active/Inactive",
        size: 120,
        cell: ({ row }) => {
          const user = row.original;
          const isToggling = toggleActiveMutation.isPending;
          return (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.isActive}
                onChange={(e) => {
                  toggleActiveMutation.mutate({
                    userId: user.id,
                    isActive: e.target.checked,
                  });
                }}
                disabled={isToggling}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] dark:bg-gray-700 disabled:opacity-50"></div>
              <span className="ml-3 text-sm font-medium text-[var(--foreground)]">
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </label>
          );
        },
      },
      {
        header: "Status",
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                row.original.isActive
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400"
                  : "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-400"
              }`}
            >
              {row.original.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ),
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        size: 100,
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        header: "Actions",
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-[var(--primary)]/10 rounded-lg transition-colors text-[var(--primary)]"
              onClick={() => {
                setSelectedUser(row.original);
                setEditUserOpen(true);
              }}
              title="Edit User"
            >
              <Pencil size={16} />
            </button>
            <button
              className="p-2 hover:bg-[var(--destructive)]/10 rounded-lg transition-colors text-[var(--destructive)]"
              onClick={() => {
                setSelectedUser(row.original);
                setDeleteUserOpen(true);
              }}
              title="Delete User"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [pagination, toggleActiveMutation]
  );
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((user) => {
      const matchSearch =
        !searchInput ||
        user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
        (user.phone && user.phone.includes(searchInput));

      return matchSearch;
    });
  }, [data, searchInput]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter: searchInput,
    },
    onGlobalFilterChange: setSearchInput,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar />

      <div className="mt-4 px-8 pb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {statistics.total}
                </p>
              </div>
              <Users className="text-primary" size={32} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{statistics.active} Active</span>
              <span>•</span>
              <span>{statistics.inactive} Inactive</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Contributors
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {statistics.byRole.CONTRIBUTOR}
                </p>
              </div>
              <UserPlus className="text-green-500" size={32} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Content Creators</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Moderators</p>
                <p className="text-3xl font-bold text-foreground">
                  {statistics.byRole.MODERATOR}
                </p>
              </div>
              <UserCheck className="text-blue-500" size={32} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Review Team</span>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative group w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                className="w-full px-4 py-3 pl-11 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] placeholder:font-normal placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-300"
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
              <Search
                className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]"
                size={20}
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 font-medium ${
                  isFilterOpen || activeFilterCount > 0
                    ? "bg-gradient-to-r from-[var(--primary)]/10 to-[var(--ring)]/10 text-[var(--primary)] border-[var(--primary)]/30"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                <Filter size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-4 space-y-4">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Role
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="role"
                          value=""
                          checked={filters.role === ""}
                          onChange={(e) =>
                            setFilters({ ...filters, role: e.target.value })
                          }
                          className="w-4 h-4 accent-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--foreground)]">
                          All Roles
                        </span>
                      </label>
                      {(["MODERATOR", "CONTRIBUTOR"] as UserRole[]).map(
                        (role) => (
                          <label
                            key={role}
                            className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                          >
                            <input
                              type="radio"
                              name="role"
                              value={role}
                              checked={filters.role === role}
                              onChange={(e) =>
                                setFilters({ ...filters, role: e.target.value })
                              }
                              className="w-4 h-4 accent-[var(--primary)]"
                            />
                            <span className="text-sm text-[var(--foreground)]">
                              {role}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)]"></div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Status
                    </label>
                    <div className="space-y-2">
                      {["", "true", "false"].map((value) => (
                        <label
                          key={value}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="radio"
                            name="isActive"
                            value={value}
                            checked={filters.isActive === value}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                isActive: e.target.value,
                              })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {value === ""
                              ? "All"
                              : value === "true"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3">
                    <button
                      onClick={() => {
                        setFilters({
                          role: "",
                          isActive: "",
                        });
                        setIsFilterOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex p-1 bg-gradient-to-r from-[var(--muted)]/30 to-[var(--accent)]/20 rounded-xl gap-1">
              <button
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                  !isTabularView
                    ? "bg-[var(--card)] text-[var(--primary)] shadow-md"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setIsTabularView(false)}
                title="Card View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                  isTabularView
                    ? "bg-[var(--card)] text-[var(--primary)] shadow-md"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setIsTabularView(true)}
                title="Table View"
              >
                <Table size={18} />
              </button>
            </div>

            {/* Create User Button */}
            <button
              onClick={() => setCreateUserOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] text-[var(--primary-foreground)] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <UserPlus size={18} />
              Create User
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-4">
          {isTabularView ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
              <TanstackTable
                table={table}
                paginatedRows={table.getPaginationRowModel().rows}
                pageIndex={0}
                pageSize={pagination.limit}
                onPageChange={(pageIndex) =>
                  setPagination((prev) => ({ ...prev, page: pageIndex + 1 }))
                }
                onPageSizeChange={(pageSize) =>
                  setPagination((prev) => ({ ...prev, limit: pageSize }))
                }
                height="calc(100vh - 500px)"
                isLoading={usersQuery.isLoading}
                isError={usersQuery.isError}
                isEmpty={!usersQuery.isLoading && filteredData.length === 0}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((user) => {
                  const RoleIcon = ROLE_ICONS[user.role];
                  return (
                    <div
                      key={user.id}
                      className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center">
                            <RoleIcon
                              className="text-[var(--primary)]"
                              size={32}
                            />
                          </div>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ROLE_COLORS[user.role]
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground mb-1 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 truncate flex items-center gap-1">
                        <Mail size={14} />
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-sm text-muted-foreground mb-4 truncate flex items-center gap-1">
                          <Phone size={14} />
                          {user.phone}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive
                              ? "bg-green-500/20 text-green-700 dark:text-green-400"
                              : "bg-red-500/20 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                        {user.emailVerified && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-700 dark:text-blue-400">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        <button
                          className="flex-1 px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditUserOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 px-3 py-2 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-colors"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteUserOpen(true);
                          }}
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="text-[var(--muted-foreground)] text-center">
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {createUserOpen && (
        <CreateUser
          open={createUserOpen}
          onClose={() => {
            setCreateUserOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          }}
        />
      )}

      {/* Edit User Modal */}
      {editUserOpen && selectedUser && (
        <CreateUser
          open={editUserOpen}
          onClose={() => {
            setEditUserOpen(false);
            setSelectedUser(null);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          }}
          user={selectedUser}
          isEdit={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Delete User Permanently
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-foreground mb-6">
              Are you sure you want to permanently delete{" "}
              <strong>{selectedUser.name}</strong>? This will remove all user
              data and cannot be reversed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDeleteUserOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedUser.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending
                  ? "Deleting..."
                  : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
