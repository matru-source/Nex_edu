import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import {
  ChevronDown,
  Search,
  Sparkles,
  BookOpen,
  TrendingUp,
  Zap,
  X,
  Loader2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface FilterState {
  category: string;
  price: string;
  status: string;
  searchQuery: string;
}

interface HeroSectionProps {
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

const priceOptions = ["Free", "Paid", "Trial"];
const statusOptions = ["Started", "Not Started", "Completed"];

export default function HeroSection({
  onFilterChange,
  activeFilters,
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>(activeFilters.searchQuery || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch real categories from API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["public-categories-hero"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_CATEGORIES);
      return (res.data.data || []) as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Debounced search handler
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onFilterChange({ ...activeFilters, searchQuery: query });
        }, 300);
      };
    })(),
    [activeFilters, onFilterChange]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle immediate search (Enter key or button click)
  const handleSearchSubmit = () => {
    onFilterChange({ ...activeFilters, searchQuery });
  };

  // Handle category quick select
  const handleCategoryQuickSelect = (categoryName: string) => {
    onFilterChange({ ...activeFilters, category: categoryName, searchQuery: "" });
    setSearchQuery("");
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    onFilterChange({ category: "", price: "", status: "", searchQuery: "" });
  };

  // Check if any filters are active
  const hasActiveFilters = activeFilters.category || activeFilters.price || 
    activeFilters.status || activeFilters.searchQuery;

  // Sync search query with external state
  useEffect(() => {
    setSearchQuery(activeFilters.searchQuery || "");
  }, [activeFilters.searchQuery]);

  const SelectDropdown = ({
    value,
    onChange,
    options,
    placeholder,
    icon: Icon,
    loading = false,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: string[] | Category[];
    placeholder: string;
    icon?: React.ElementType;
    loading?: boolean;
  }) => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-3 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        {loading ? (
          <div className={`w-full ${Icon ? "pl-9" : "pl-4"} pr-8 py-2.5 text-sm bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl text-muted-foreground flex items-center gap-2`}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading...
          </div>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${
              Icon ? "pl-9" : "pl-4"
            } pr-8 py-2.5 text-sm bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 appearance-none cursor-pointer transition-all duration-300 hover:border-primary/30 hover:bg-card`}
          >
            <option value="" className="bg-card">
              {placeholder}
            </option>
            {(options as any[]).map((opt) => {
              const optValue = typeof opt === "string" ? opt : opt.name;
              return (
                <option key={optValue} value={optValue} className="bg-card">
                  {optValue}
                </option>
              );
            })}
          </select>
        )}
        <ChevronDown className="w-4 h-4 absolute right-3 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="relative mb-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative border border-border/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
        {/* Top Badge */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Explore & Learn
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Find Your Perfect
            <span className="relative mx-2">
              <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Course
              </span>
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Search, filter, and discover courses tailored to your learning goals
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div
            className={`relative flex items-center transition-all duration-300 ${
              isSearchFocused ? "scale-[1.01]" : ""
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-xl blur-md transition-opacity duration-300 ${
                isSearchFocused ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="relative flex-1 flex items-center bg-card border border-border/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Search className="w-5 h-5 ml-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                placeholder="Search courses by title or description..."
                className="flex-1 px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    onFilterChange({ ...activeFilters, searchQuery: "" });
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="max-w-3xl mx-auto mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Quick Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="ml-2 text-xs px-2 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectDropdown
              value={activeFilters.category}
              onChange={(value) =>
                onFilterChange({ ...activeFilters, category: value })
              }
              options={categories}
              placeholder="All Categories"
              icon={BookOpen}
              loading={categoriesLoading}
            />
            <SelectDropdown
              value={activeFilters.price}
              onChange={(value) =>
                onFilterChange({ ...activeFilters, price: value })
              }
              options={priceOptions}
              placeholder="All Prices"
              icon={Sparkles}
            />
            <SelectDropdown
              value={activeFilters.status}
              onChange={(value) =>
                onFilterChange({ ...activeFilters, status: value })
              }
              options={statusOptions}
              placeholder="All Status"
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Quick Category Tags */}
        {categories.length > 0 && !categoriesLoading && (
          <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryQuickSelect(cat.name)}
                className={`px-3 py-1 text-xs rounded-lg border transition-all duration-300 ${
                  activeFilters.category === cat.name
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="text-xs text-muted-foreground">Filtering by:</span>
            {activeFilters.searchQuery && (
              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                Search: "{activeFilters.searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery("");
                    onFilterChange({ ...activeFilters, searchQuery: "" });
                  }}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFilters.category && (
              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                {activeFilters.category}
                <button
                  onClick={() => onFilterChange({ ...activeFilters, category: "" })}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFilters.price && (
              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                {activeFilters.price}
                <button
                  onClick={() => onFilterChange({ ...activeFilters, price: "" })}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFilters.status && (
              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                {activeFilters.status}
                <button
                  onClick={() => onFilterChange({ ...activeFilters, status: "" })}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
