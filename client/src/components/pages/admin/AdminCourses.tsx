import {
  ArrowRight,
  PlusCircle,
  Pencil,
  Trash2,
  Filter,
  FileText,
  X,
  Folder,
} from "lucide-react";
import TopBar from "../../lazy/TopBar";
import useRouter from "../../../hooks/useRouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import AdminCourseCard from "../../ui/Cards/AdminCourseCard";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { TanstackTable } from "../../lazy/TanstackTable";
import type { CourseWithCategory, Category } from "../../../types";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import ConfirmDialog from "../../lazy/ConfirmDialog";
import Modal from "../../lazy/Modal";
import MaterialManager from "../../ui/Courses/Material";
import UploadImage from "../../lazy/UploadImage";
import CourseDetailsPanel from "../../ui/Courses/details/CourseDetailsPanel";
import { Info } from "lucide-react";

interface CourseQuery extends Response {
  data: CourseWithCategory[];
}

interface CategoryQuery extends Response {
  data: Category[];
}

interface CourseWithFlags extends CourseWithCategory {
  flags?: string[];
  status?: string;
}

export default function AdminCourses() {
  useInitNavStackOnce([{ title: "Value Stream", path: "/admin/courses" }]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<CourseWithCategory | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [materialManagerOpen, setMaterialManagerOpen] = useState(false);
  const [flagFilter, setFlagFilter] = useState<string>("");
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] =
    useState<CourseWithCategory | null>(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] =
    useState<CourseWithCategory | null>(null);

  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    published: boolean;
    tumbnailUrl: string;
  }>({
    title: "",
    description: "",
    published: false,
    tumbnailUrl: "",
  });

  const [filters, setFilters] = useState({
    category: "" as string,
    status: "" as string,
    flag: "" as string, // Add this
  });

  const coursesQuery = useQuery({
    queryKey: ["courses", flagFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (flagFilter) {
        params.append("flag", flagFilter);
      }
      const url = flagFilter
        ? `${API_ROUTES.COURSE.GET_COURSES}?${params.toString()}`
        : API_ROUTES.COURSE.GET_COURSES;
      const res = await api.get<CourseQuery>(url);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<CategoryQuery>(
        API_ROUTES.COURSE.GET_CATEGORIES
      );
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => {
      const res = await api.put(
        API_ROUTES.COURSE.UPDATE.COURSE(payload.id),
        payload.data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.COURSE.DELETE.COURSE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const openEdit = (row: CourseWithCategory) => {
    setSelected(row);
    setEditForm({
      title: row.title,
      description: row.description,
      published: (row as any).published ?? false,
      tumbnailUrl: (row as any).tumbnailUrl ?? "",
    });
    setEditOpen(true);
  };

  const openDelete = (row: CourseWithCategory) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  const openMaterialManager = (course: CourseWithCategory) => {
    setSelectedCourseForMaterials(course);
    setMaterialManagerOpen(true);
  };

  const [isTabularView] = useState(true);
  const [searchInput, setSearchInput] = useState<string>("");

  const data = useMemo(() => coursesQuery.data?.data || [], [coursesQuery.data]);

  // Get unique categories from courses data (fallback)
  const uniqueCategories = useMemo(() => {
    if (!data) return [];
    const categorySet = new Set(data.map((course) => course.category.name));
    return Array.from(categorySet).sort();
  }, [data]);

  // Get unique statuses from courses data
  const uniqueStatuses = useMemo(() => {
    if (!data) return [];
    const hasPublished = data.some((course) => course.published);
    const hasDraft = data.some((course) => !course.published);
    const statuses: string[] = [];
    if (hasPublished) statuses.push("Published");
    if (hasDraft) statuses.push("Draft");
    return statuses;
  }, [data]);

  // Use fetched categories, fallback to unique from courses
  const availableCategories = useMemo(() => {
    if (categoriesQuery.data?.data && categoriesQuery.data.data.length > 0) {
      return categoriesQuery.data.data.map((cat) => cat.name).sort();
    }
    return uniqueCategories;
  }, [categoriesQuery.data, uniqueCategories]);

  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const columns = useMemo<ColumnDef<CourseWithCategory>[]>(
    () => [
      { header: "#", size: 50, cell: ({ row }) => row.index + 1 },
      {
        header: "Value Stream",
        accessorKey: "title",
        size: 150,
        cell: ({ row }) => (
          <div
            className="font-medium text-[var(--foreground)] truncate"
            title={row.original.title}
          >
            {row.original.title}
          </div>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        size: 180,
        cell: ({ row }) => (
          <div
            className="truncate text-[var(--muted-foreground)]"
            title={row.original.description}
          >
            {row.original.description}
          </div>
        ),
      },
      {
        header: "Brand",
        accessorKey: "category.name",
        size: 140,
        cell: ({ row }) => (
          <span
            className="px-2 py-1 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--ring)]/20 text-[var(--primary)] rounded-full text-xs whitespace-nowrap font-medium truncate block"
            title={row.original.category.name}
          >
            {row.original.category.name}
          </span>
        ),
      },
      {
        header: "Application",
        accessorKey: "subCategory.name",
        size: 140,
        cell: ({ row }) => (
          <span
            className="px-2 py-1 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--secondary)]/20 text-[var(--muted-foreground)] rounded-full text-xs whitespace-nowrap font-medium truncate block"
            title={row.original.subCategory.name}
          >
            {row.original.subCategory.name}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "published",
        size: 100,
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap font-medium ${
              row.original.published
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400"
                : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400"
            }`}
          >
            {row.original.published ? "Published" : "Draft"}
          </span>
        ),
      },
      // {
      //   header: "Flags",
      //   size: 180,
      //   cell: ({ row }) => (
      //     <div className="flex flex-wrap gap-1">
      //       {(row.original as CourseWithFlags).flags &&
      //       (row.original as CourseWithFlags).flags!.length > 0 ? (
      //         (row.original as CourseWithFlags).flags!.map((flag) => (
      //           <span
      //             key={flag}
      //             className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 whitespace-nowrap"
      //             title={flag}
      //           >
      //             {flag.replace(/_/g, " ")}
      //           </span>
      //         ))
      //       ) : (
      //         <span className="text-xs text-[var(--muted-foreground)]">—</span>
      //       )}
      //     </div>
      //   ),
      // },
      {
        header: "Actions",
        size: 140,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row.original);
              }}
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openMaterialManager(row.original);
              }}
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors"
              title="Manage Materials"
            >
              <FileText size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCourseForDetails(row.original);
                setDetailsPanelOpen(true);
              }}
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--primary)]"
              title="View Details"
            >
              <Info size={14} />
            </button>
            <button
              className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openDelete(row.original);
              }}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
      {
        header: "Module",
        size: 70,
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                "/admin/skill_category/" + row.original.id,
                "Module"
              );
            }}
            className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300"
            title="View Module"
          >
            <ArrowRight size={14} />
          </button>
        ),
      },
    ],
    []
  );

  // Filter data based on search and filters
  const filteredCardData = useMemo(() => {
    if (!data) return [];
    return data.filter((course) => {
      const matchSearch =
        !searchInput ||
        course.title.toLowerCase().includes(searchInput.toLowerCase()) ||
        course.description.toLowerCase().includes(searchInput.toLowerCase()) ||
        course.category.name
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        course.subCategory.name
          .toLowerCase()
          .includes(searchInput.toLowerCase());

      const matchCategory =
        !filters.category || course.category.name === filters.category;

      const matchStatus =
        !filters.status ||
        (filters.status === "Published" && course.published) ||
        (filters.status === "Draft" && !course.published);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [data, searchInput, filters]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 30,
  });

  const table = useReactTable({
    data: filteredCardData,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar>
        <button
          className="btn"
          onClick={() => router.push("/admin/courses/create", "Create Value Stream")}
        >
          <PlusCircle size={16} /> Create Value Stream
        </button>
      </TopBar>

      <div className="mt-8 px-8 pb-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative group w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search Value Stream by title, description, or Brand..."
                className="w-full px-4 py-3 pl-11 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] placeholder:font-normal placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-300"
                onChange={handleSearchChange}
                value={searchInput}
              />
              <svg
                className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex items-center gap-3">
              {/* Categories Link Button */}
              <button
                onClick={() => router.push("/admin/categories", "Brand")}
                className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/30 transition-all duration-300 flex items-center gap-2 font-medium"
                title="Manage Brand & Application"
              >
                <Folder size={18} />
                <span className="hidden sm:inline">Brand</span>
              </button>

              {/* Filter Button */}
              <div className="relative ml-0 sm:ml-3" ref={filterRef}>
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
                  <div
                    className="absolute right-0 top-full mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto"
                    style={{ maxWidth: "calc(100vw - 2rem)" }}
                  >
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                        Brand
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors">
                          <input
                            type="radio"
                            name="category"
                            value=""
                            checked={filters.category === ""}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                category: e.target.value,
                              })
                            }
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            All Brands
                          </span>
                        </label>
                        {categoriesQuery.isLoading ? (
                          <div className="text-sm text-[var(--muted-foreground)] p-2">
                            Loading Brands...
                          </div>
                        ) : availableCategories.length > 0 ? (
                          availableCategories.map((category) => (
                            <label
                              key={category}
                              className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                            >
                              <input
                                type="radio"
                                name="category"
                                value={category}
                                checked={filters.category === category}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    category: e.target.value,
                                  })
                                }
                                className="w-4 h-4 accent-[var(--primary)]"
                              />
                              <span className="text-sm text-[var(--foreground)]">
                                {category}
                              </span>
                            </label>
                          ))
                        ) : (
                          <div className="text-sm text-[var(--muted-foreground)] p-2">
                            No Brands available
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-[var(--border)]"></div>

                    {/* Flag Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                        Flag
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors">
                          <input
                            type="radio"
                            name="flag"
                            value=""
                            checked={filters.flag === ""}
                            onChange={(e) => {
                              setFilters({ ...filters, flag: e.target.value });
                              setFlagFilter(e.target.value);
                            }}
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            All Flags
                          </span>
                        </label>
                        {[
                          "FREE",
                          "PAID",
                          "DEMO",
                          "COMING_SOON",
                          "FREE_TRIAL",
                          "ON_DEMAND",
                        ].map((flag) => (
                          <label
                            key={flag}
                            className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)]/30 p-2 rounded-lg transition-colors"
                          >
                            <input
                              type="radio"
                              name="flag"
                              value={flag}
                              checked={filters.flag === flag}
                              onChange={(e) => {
                                setFilters({
                                  ...filters,
                                  flag: e.target.value,
                                });
                                setFlagFilter(e.target.value);
                              }}
                              className="w-4 h-4 accent-[var(--primary)]"
                            />
                            <span className="text-sm text-[var(--foreground)]">
                              {flag.replace(/_/g, " ")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                        Status
                      </label>
                      <div className="space-y-2">
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
                        {uniqueStatuses.length > 0 ? (
                          uniqueStatuses.map((status) => (
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
                                  setFilters({
                                    ...filters,
                                    status: e.target.value,
                                  })
                                }
                                className="w-4 h-4 accent-[var(--primary)]"
                              />
                              <span className="text-sm text-[var(--foreground)]">
                                {status}
                              </span>
                            </label>
                          ))
                        ) : (
                          <div className="text-sm text-[var(--muted-foreground)] p-2">
                            No status options available
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-3">
                      <button
                        onClick={() => {
                          setFilters({ category: "", status: "", flag: "" });
                          setFlagFilter("");
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
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">
          {!isTabularView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCardData.length > 0 ? (
                filteredCardData.map((course) => (
                  <div
                    key={course.id}
                    onClick={() =>
                      router.push(
                        "/admin/courses/view/" + course.id,
                        "Value Stream Details"
                      )
                    }
                    className="cursor-pointer"
                  >
                    <AdminCourseCard course={course} />
                    {/* Add flags display below card */}
                    {(course as CourseWithFlags).flags &&
                      (course as CourseWithFlags).flags!.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 px-2">
                          {(course as CourseWithFlags).flags!.map((flag) => (
                            <span
                              key={flag}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300"
                            >
                              {flag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="text-[var(--muted-foreground)] text-center">
                    <p className="text-lg font-medium">No Value Stream found</p>
                    <p className="text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
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
                height="calc(100vh - 330px)"
                isLoading={coursesQuery.isLoading}
                isError={coursesQuery.isError}
                isEmpty={
                  !coursesQuery.isLoading && filteredCardData.length === 0
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="w-[560px] max-h-[90vh] flex flex-col">
          {/* Header with close button */}
          <div className="p-6 border-b border-[var(--border)] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Edit Value Stream
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {selected?.title}
                </p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Title
              </label>
              <input
                className="input-form"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Description
              </label>
              <textarea
                className="input-form h-28 resize-none"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            {/* Thumbnail Upload */}
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Thumbnail Image
              </label>
              <div className="w-full">
                <UploadImage
                  imageUrl={editForm.tumbnailUrl || null}
                  setImageUrl={(url: string) =>
                    setEditForm((prev) => ({ ...prev, tumbnailUrl: url }))
                  }
                  width="full"
                  height={200}
                  text="Click to upload thumbnail image"
                />
              </div>
              {editForm.tumbnailUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((prev) => ({ ...prev, tumbnailUrl: "" }))
                  }
                  className="mt-2 text-sm text-[var(--destructive)] hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
            <label className="inline-flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--muted)]/30 transition-colors">
              <input
                type="checkbox"
                checked={editForm.published}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    published: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                Publish this course
              </span>
            </label>
          </div>

          {/* Footer - fixed at bottom */}
          <div className="p-6 border-t border-[var(--border)] flex justify-end gap-2 flex-shrink-0">
            <button
              className="px-4 py-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]/30 transition-all duration-300 font-medium"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn disabled:opacity-50"
              onClick={() =>
                selected &&
                updateMutation.mutate({ id: selected.id, data: editForm })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        onClose={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
      {materialManagerOpen && selectedCourseForMaterials && (
        <MaterialManager
          isOpen={materialManagerOpen}
          onClose={() => {
            setMaterialManagerOpen(false);
            setSelectedCourseForMaterials(null);
          }}
          currentLevel={{
            type: "course",
            id: selectedCourseForMaterials.id,
            title: selectedCourseForMaterials.title,
            parentIds: {
              courseId: selectedCourseForMaterials.id,
            },
          }}
        />
      )}
      {detailsPanelOpen && selectedCourseForDetails && (
        <CourseDetailsPanel
          isOpen={detailsPanelOpen}
          onClose={() => {
            setDetailsPanelOpen(false);
            setSelectedCourseForDetails(null);
          }}
          courseId={selectedCourseForDetails.id}
        />
      )}
    </div>
  );
}
