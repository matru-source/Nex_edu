import {
  ShoppingCart,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Table,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Eye,
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

interface Purchase {
  id: string;
  amount: number;
  purchaseAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  chapter: {
    id: string;
    title: string;
    module: {
      expertise: {
        skillCategory: {
          course: {
            id: string;
            title: string;
          };
        };
      };
    };
  };
}

interface PurchasesQuery extends Response {
  data: Purchase[];
  statistics?: {
    total: number;
    totalRevenue: number;
    averagePurchase: number;
    todayRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number; // percentage
    purchaseGrowth: number; // percentage
  };
}

export default function AdminPurchases() {
  useInitNavStackOnce([{ title: "Purchases", path: "/admin/purchases" }]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [isTabularView, setIsTabularView] = useState(true);

  const [filters, setFilters] = useState({
    dateRange: "" as string,
    minAmount: "" as string,
    maxAmount: "" as string,
  });

  const purchasesQuery = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      const res = await api.get<PurchasesQuery>(
        API_ROUTES.ADMIN.GET_ALL_PURCHASES
      );
      return res.data;
    },
  });

  const data = useMemo(
    () => purchasesQuery.data?.data || [],
    [purchasesQuery.data]
  );
  const statistics = useMemo(
    () => purchasesQuery.data?.statistics,
    [purchasesQuery.data]
  );

  const columns = useMemo<ColumnDef<Purchase>[]>(
    () => [
      { header: "#", size: 40, cell: ({ row }) => row.index + 1 },
      {
        header: "Student",
        accessorKey: "user.name",
        size: 150,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-[var(--foreground)]">
              {row.original.user.name}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {row.original.user.email}
            </div>
          </div>
        ),
      },
      {
        header: "Value Stream",
        accessorKey: "chapter.module.expertise.skillCategory.course.title",
        size: 200,
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)] truncate max-w-[180px]">
            {row.original.chapter.module.expertise.skillCategory.course.title}
          </div>
        ),
      },
      {
        header: "Chapter",
        accessorKey: "chapter.title",
        size: 180,
        cell: ({ row }) => (
          <div className="text-[var(--muted-foreground)] truncate max-w-[160px]">
            {row.original.chapter.title}
          </div>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        size: 100,
        cell: ({ row }) => (
          <div className="font-bold text-[var(--primary)]">
            ${row.original.amount.toFixed(2)}
          </div>
        ),
      },
      {
        header: "Date",
        accessorKey: "purchaseAt",
        size: 120,
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            {new Date(row.original.purchaseAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        header: "Time",
        accessorKey: "purchaseAt",
        size: 100,
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            {new Date(row.original.purchaseAt).toLocaleTimeString()}
          </div>
        ),
      },
      {
        header: "Actions",
        size: 80,
        cell: ({ row }) => (
          <button
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            onClick={() => {
              console.log("View purchase:", row.original.id);
            }}
            title="View Details"
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((purchase) => {
      const matchSearch =
        !searchInput ||
        purchase.user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        purchase.user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
        purchase.chapter.title
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        purchase.chapter.module.expertise.skillCategory.course.title
          .toLowerCase()
          .includes(searchInput.toLowerCase());

      const purchaseDate = new Date(purchase.purchaseAt);
      const now = new Date();
      const matchDateRange =
        !filters.dateRange ||
        (filters.dateRange === "today" &&
          purchaseDate.toDateString() === now.toDateString()) ||
        (filters.dateRange === "week" &&
          purchaseDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (filters.dateRange === "month" &&
          purchaseDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) ||
        (filters.dateRange === "year" &&
          purchaseDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));

      const matchMinAmount =
        !filters.minAmount || purchase.amount >= parseFloat(filters.minAmount);
      const matchMaxAmount =
        !filters.maxAmount || purchase.amount <= parseFloat(filters.maxAmount);

      return matchSearch && matchDateRange && matchMinAmount && matchMaxAmount;
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

      <div className="mt-8 px-8 pb-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <DollarSign className="text-primary" size={32} />
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.total} total purchases
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    This Month
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    ${statistics.thisMonthRevenue.toFixed(2)}
                  </p>
                </div>
                <Calendar className="text-primary" size={32} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {statistics.revenueGrowth >= 0 ? (
                  <TrendingUp className="text-green-500" size={16} />
                ) : (
                  <TrendingDown className="text-red-500" size={16} />
                )}
                <p
                  className={`text-xs font-medium ${
                    statistics.revenueGrowth >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {Math.abs(statistics.revenueGrowth).toFixed(1)}% vs last month
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Today's Revenue
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    ${statistics.todayRevenue.toFixed(2)}
                  </p>
                </div>
                <ShoppingCart className="text-primary" size={32} />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Average Purchase
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    ${statistics.averagePurchase.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="text-primary" size={32} />
              </div>
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
                placeholder="Search purchases by student, Value Stream, or chapter..."
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
                <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-4 space-y-4">
                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Date Range
                    </label>
                    <div className="space-y-2">
                      {["", "today", "week", "month", "year"].map((value) => (
                        <label
                          key={value}
                          className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="radio"
                            name="dateRange"
                            value={value}
                            checked={filters.dateRange === value}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                dateRange: e.target.value,
                              })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)] capitalize">
                            {value === "" ? "All Time" : value}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)]"></div>

                  {/* Amount Range Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Amount Range
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Min amount"
                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                        value={filters.minAmount}
                        onChange={(e) =>
                          setFilters({ ...filters, minAmount: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Max amount"
                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                        value={filters.maxAmount}
                        onChange={(e) =>
                          setFilters({ ...filters, maxAmount: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3">
                    <button
                      onClick={() => {
                        setFilters({
                          dateRange: "",
                          minAmount: "",
                          maxAmount: "",
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
        <div className="mt-6">
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
                isLoading={purchasesQuery.isLoading}
                isError={purchasesQuery.isError}
                isEmpty={!purchasesQuery.isLoading && filteredData.length === 0}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ring)]/20 flex items-center justify-center">
                        <ShoppingCart className="text-primary" size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[var(--primary)]">
                          ${purchase.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Student
                        </p>
                        <p className="font-medium text-foreground">
                          {purchase.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {purchase.user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Value Stream
                        </p>
                        <p className="font-medium text-foreground truncate">
                          {
                            purchase.chapter.module.expertise.skillCategory
                              .course.title
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Chapter
                        </p>
                        <p className="font-medium text-foreground truncate">
                          {purchase.chapter.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={14} />
                          {new Date(purchase.purchaseAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(purchase.purchaseAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="text-[var(--muted-foreground)] text-center">
                    <p className="text-lg font-medium">No purchases found</p>
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
