import {
  Users,
  Search,
  Filter,
  Table,
  LayoutGrid,
  Eye,
  TrendingUp,
  UserCheck,
  Ban,
} from "lucide-react";
import TopBar from "../../lazy/TopBar";
import { useQuery } from "@tanstack/react-query";
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
import type { Response } from "../../../types";
import { useNavigate } from "react-router-dom";

interface Student {
  id: string;
  name: string;
  email: string;
  goal: string | null;
  currentStatus: string | null;
  emailVerified: boolean;
  isBlocked: boolean; // Added isBlocked
  profilePhoto: string | null; // Added profilePhoto
  createdAt: string;
  _count?: {
    Purchase: number;
    QuizAttempt: number;
    ViewingHistory: number;
  };
  totalSpent?: number;
}

interface StudentsQuery extends Response {
  data: Student[];
  statistics?: {
    total: number;
    verified: number;
    unverified: number;
    withPurchases: number;
    totalRevenue: number;
    averageSpent: number;
    purchaseRatio: number; // percentage of students who made purchases
  };
}

const GOALS = [
  "Career Change",
  "Skill Enhancement",
  "Certification",
  "Personal Interest",
  "Not Specified",
];

const STATUSES = [
  "Student",
  "Professional",
  "Unemployed",
  "Entrepreneur",
  "Not Specified",
];

export default function AdminStudents() {
  useInitNavStackOnce([{ title: "Students", path: "/admin/students" }]);
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [isTabularView, setIsTabularView] = useState(true);

  const [filters, setFilters] = useState({
    goal: "" as string,
    status: "" as string,
    verified: "" as string,
    hasPurchases: "" as string,
    blocked: "" as string, // Added blocked filter
  });

  const studentsQuery = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const res = await api.get<StudentsQuery>(
        API_ROUTES.ADMIN.GET_ALL_STUDENTS
      );
      return res.data;
    },
  });

  const data = useMemo(
    () => studentsQuery.data?.data || [],
    [studentsQuery.data]
  );
  const statistics = useMemo(
    () => studentsQuery.data?.statistics,
    [studentsQuery.data]
  );

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      { header: "#", size: 40, cell: ({ row }) => row.index + 1 },
      {
        header: "Name",
        accessorKey: "name",
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border)]">
                {row.original.profilePhoto ? (
                  <img src={row.original.profilePhoto} alt={row.original.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="text-primary w-4 h-4" />
                )}
             </div>
            <div className="font-medium text-[var(--foreground)]">
              {row.original.name}
            </div>
          </div>
        ),
      },
      {
        header: "Email",
        accessorKey: "email",
        size: 200,
        cell: ({ row }) => (
          <div className="text-[var(--muted-foreground)] truncate max-w-[180px]">
            {row.original.email}
          </div>
        ),
      },

      {
        header: "Status",
        accessorKey: "status",
        size: 100,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 items-start">
             <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                row.original.emailVerified
                  ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30"
                  : "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/30"
              }`}
            >
              {row.original.emailVerified ? "Verified" : "Unverified"}
            </span>
            {row.original.isBlocked && (
               <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30 flex items-center gap-1">
                 <Ban className="w-3 h-3" /> Blocked
               </span>
            )}
          </div>
        ),
      },
      {
        header: "Purchases",
        accessorKey: "_count.Purchase",
        size: 80,
        cell: ({ row }) => (
          <div className="text-center font-medium text-[var(--foreground)]">
            {row.original._count?.Purchase || 0}
          </div>
        ),
      },
      {
        header: "Total Spent",
        accessorKey: "totalSpent",
        size: 100,
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)]">
            ${(row.original.totalSpent || 0).toFixed(2)}
          </div>
        ),
      },
      {
        header: "Joined",
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
        size: 60,
        cell: ({ row }) => (
          <button
            className="p-2 hover:bg-[var(--primary)]/10 text-[var(--muted-foreground)] hover:text-[var(--primary)] rounded-lg transition-colors"
            onClick={() => {
              navigate(`/admin/students/${row.original.id}`);
            }}
            title="View Details"
          >
            <Eye size={18} />
          </button>
        ),
      },
    ],
    [navigate]
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((student) => {
      const matchSearch =
        !searchInput ||
        student.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        student.email.toLowerCase().includes(searchInput.toLowerCase());

      const matchGoal = !filters.goal || student.goal === filters.goal;
      const matchStatus =
        !filters.status || student.currentStatus === filters.status;
      const matchVerified =
        filters.verified === "" ||
        (filters.verified === "verified" && student.emailVerified) ||
        (filters.verified === "unverified" && !student.emailVerified);
      const matchPurchases =
        filters.hasPurchases === "" ||
        (filters.hasPurchases === "yes" &&
          (student._count?.Purchase || 0) > 0) ||
        (filters.hasPurchases === "no" &&
          (student._count?.Purchase || 0) === 0);
          
      const matchBlocked = 
        filters.blocked === "" ||
        (filters.blocked === "blocked" && student.isBlocked) ||
        (filters.blocked === "active" && !student.isBlocked);


      return (
        matchSearch &&
        matchGoal &&
        matchStatus &&
        matchVerified &&
        matchPurchases &&
        matchBlocked
      );
    });
  }, [data, searchInput, filters]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 30,
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter: searchInput,
      pagination,
    },
    onGlobalFilterChange: setSearchInput,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar />

      <div className="mt-4 px-8 pb-">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {statistics.total}
                  </p>
                </div>
                <Users className="text-primary" size={32} />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Purchase Ratio
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {statistics.purchaseRatio.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="text-primary" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {statistics.withPurchases} of {statistics.total} students
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    ${statistics.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="text-primary" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg: ${statistics.averageSpent.toFixed(2)} per student
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Verified Students
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {statistics.verified}
                  </p>
                </div>
                <UserCheck className="text-primary" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {statistics.unverified} unverified
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative group w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search students by name or email..."
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
            <div className="relative ml-0 sm:ml-3">
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
                <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Goal Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Learning Goal
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="goal"
                          value=""
                          checked={filters.goal === ""}
                          onChange={(e) =>
                            setFilters({ ...filters, goal: e.target.value })
                          }
                          className="w-4 h-4 accent-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--foreground)]">
                          All Goals
                        </span>
                      </label>
                      {GOALS.map((goal) => (
                        <label
                          key={goal}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="radio"
                            name="goal"
                            value={goal}
                            checked={filters.goal === goal}
                            onChange={(e) =>
                              setFilters({ ...filters, goal: e.target.value })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {goal}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)]"></div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Current Status
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="status"
                          value=""
                          checked={filters.status === ""}
                          onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                          }
                          className="w-4 h-4 accent-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--foreground)]">
                          All Status
                        </span>
                      </label>
                      {STATUSES.map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={filters.status === status}
                            onChange={(e) =>
                              setFilters({ ...filters, status: e.target.value })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {status}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)]"></div>

                  {/* Verified Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Email Verification
                    </label>
                    <div className="space-y-2">
                      {["", "verified", "unverified"].map((value) => (
                        <label
                          key={value}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="radio"
                            name="verified"
                            value={value}
                            checked={filters.verified === value}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                verified: e.target.value,
                              })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {value === ""
                              ? "All"
                              : value === "verified"
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)]"></div>

                  {/* Has Purchases Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Has Purchases
                    </label>
                    <div className="space-y-2">
                      {["", "yes", "no"].map((value) => (
                        <label
                          key={value}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="radio"
                            name="hasPurchases"
                            value={value}
                            checked={filters.hasPurchases === value}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                hasPurchases: e.target.value,
                              })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {value === ""
                              ? "All"
                              : value === "yes"
                              ? "Yes"
                              : "No"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)]"></div>

                  {/* Blocked Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                       Account Status
                    </label>
                    <div className="space-y-2">
                      {["", "active", "blocked"].map((value) => (
                        <label
                          key={value}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="radio"
                            name="blocked"
                            value={value}
                            checked={filters.blocked === value}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                blocked: e.target.value,
                              })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {value === ""
                              ? "All"
                              : value === "active"
                              ? "Active"
                              : "Blocked"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3">
                    <button
                      onClick={() => {
                        setFilters({
                          goal: "",
                          status: "",
                          verified: "",
                          hasPurchases: "",
                          blocked: "",
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
            <div className="flex p-1 bg-gradient-to-r from-[var(--muted)]/30 to-[var(--accent)]/20 rounded-xl gap-1 ml-0 sm:ml-3">
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
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-4">
          {isTabularView ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
              <TanstackTable
                table={table}
                paginatedRows={table.getPaginationRowModel().rows}
                pageIndex={table.getState().pagination.pageIndex}
                pageSize={table.getState().pagination.pageSize}
                onPageChange={(pageIndex) =>
                  setPagination((prev) => ({ ...prev, pageIndex }))
                }
                onPageSizeChange={(pageSize) =>
                  setPagination((prev) => ({ ...prev, pageSize }))
                }
                height="calc(100vh - 400px)"
                isLoading={studentsQuery.isLoading}
                isError={studentsQuery.isError}
                isEmpty={!studentsQuery.isLoading && filteredData.length === 0}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((student) => (
                  <div
                    key={student.id}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center">
                        <Users className="text-primary" size={24} />
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          student.emailVerified
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {student.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground mb-1 truncate">
                      {student.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 truncate">
                      {student.email}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Purchases:
                        </span>
                        <span className="font-medium text-foreground">
                          {student._count?.Purchase || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Spent:
                        </span>
                        <span className="font-medium text-foreground">
                          ${(student.totalSpent || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="text-[var(--muted-foreground)] text-center">
                    <p className="text-lg font-medium">No students found</p>
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
    </div>
  );
}
