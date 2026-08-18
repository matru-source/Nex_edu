import { flexRender, type Table } from "@tanstack/react-table";
import { Pagination } from "./Pagination";

interface TanstackTableProps<T> {
  table: Table<T>;
  paginatedRows: ReturnType<Table<T>["getRowModel"]>["rows"];
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  height?: string;
  className?: string;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
}

export function TanstackTable<T>({
  table,
  paginatedRows,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  height = "calc(100vh - 320px)",
  className = "",
  isLoading,
  isError,
  isEmpty = false,
}: TanstackTableProps<T>) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${className}`}
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Table container with fixed bottom scrollbar */}
      <div
        className="relative flex flex-col"
        style={{ 
          height: height,
        }}
      >
        <div 
          className="flex-1 overflow-auto scrollbar-table w-full relative"
          style={{
            zIndex: 0
          }}
        >
          <table
            className="w-full relative"
            style={{
              tableLayout: "fixed",
              minWidth: "100%",
              borderCollapse: "separate", 
              borderSpacing: 0
            }}
          >
            {/* Premium Header */}
            <thead className="sticky top-0 z-20 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  style={{ 
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-left"
                      style={{
                        color: "var(--muted-foreground)",
                        background: "linear-gradient(to bottom, var(--muted) 0%, color-mix(in srgb, var(--muted) 90%, var(--card) 10%) 100%)",
                        backdropFilter: "blur(8px)",
                        width: `${header.getSize()}px`,
                        letterSpacing: "0.05em",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {/* Empty State */}
              {isEmpty && !isLoading && !isError ? (
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ 
                          background: "linear-gradient(135deg, var(--muted) 0%, color-mix(in srgb, var(--muted) 80%, var(--primary) 20%) 100%)",
                        }}
                      >
                        <svg
                          className="w-7 h-7"
                          style={{ color: "var(--muted-foreground)" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        No data available
                      </p>
                      <p
                        className="text-xs mt-1.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        There are no records to display
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {/* Loading Skeletons */}
              {isLoading
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <tr
                      key={`loading-row-${idx}`}
                      style={{ 
                        borderBottom: "1px solid var(--border)",
                        opacity: 1 - idx * 0.08,
                      }}
                    >
                      {table.getAllColumns().map((_, colIdx) => (
                        <td key={colIdx} className="py-4 px-4">
                          <div 
                            className="animate-pulse"
                            style={{
                              animationDelay: `${colIdx * 50}ms`,
                            }}
                          >
                            <div
                              className="h-4 rounded-md"
                              style={{
                                background: "linear-gradient(90deg, var(--muted) 0%, color-mix(in srgb, var(--muted) 70%, var(--card) 30%) 50%, var(--muted) 100%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s ease-in-out infinite",
                                width:
                                  colIdx % 3 === 0
                                    ? "75%"
                                    : colIdx % 3 === 1
                                    ? "50%"
                                    : "85%",
                              }}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                : null}

              {/* Error State */}
              {isError ? (
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ 
                          background: "linear-gradient(135deg, color-mix(in srgb, var(--destructive) 20%, transparent 80%) 0%, color-mix(in srgb, var(--destructive) 10%, transparent 90%) 100%)",
                        }}
                      >
                        <svg
                          className="w-7 h-7"
                          style={{ color: "var(--destructive)" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--destructive)" }}
                      >
                        Error loading data
                      </p>
                      <p
                        className="text-xs mt-1.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Please try again later
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {/* Data Rows */}
              {!isLoading &&
                !isError &&
                !isEmpty &&
                paginatedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group/row transition-all duration-200 ease-out"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "color-mix(in srgb, var(--muted) 40%, var(--card) 60%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--card)";
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-2.5 px-4 text-sm transition-colors duration-200"
                        style={{
                          color: "var(--foreground)",
                          width: `${cell.column.getSize()}px`,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {!isLoading && !isError && !isEmpty && (
        <div
          className="px-4 py-3"
          style={{
            borderTop: "1px solid var(--border)",
            background: "linear-gradient(to top, var(--muted) 0%, var(--card) 100%)",
          }}
        >
          <Pagination
            currentPage={pageIndex}
            totalItems={table.getFilteredRowModel().rows.length}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}

      {/* Custom scrollbar and shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

