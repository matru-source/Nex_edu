import { useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Sparkles,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";

type Category = {
  id: string;
  name: string;
  description?: string;
  tumbnailUrl?: string | null;
};

type SubCategory = {
  id: string;
  name: string;
  categoryId?: string | null;
  tumbnailUrl?: string | null;
  description?: string;
};

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Fetch all categories
  const categoriesQuery = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_CATEGORIES);
      return (res.data.data || []) as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all subcategories independently
  const subCategoriesQuery = useQuery({
    queryKey: ["public-subcategories-all"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_ALL_SUBCATEGORIES);
      return (res.data.data || []) as SubCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleCategoryClick = (category: Category) => {
    setIsOpen(false);
    navigate(`/catalog/specialization/${category.id}`, {
      state: { categoryName: category.name },
    });
  };

  const handleSubCategoryClick = (subCategory: SubCategory) => {
    setIsOpen(false);
    navigate(`/catalog/brand/${subCategory.id}`, {
      state: { subCategoryName: subCategory.name },
    });
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleDropdownEnter}
      onMouseLeave={handleDropdownLeave}
    >
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 border border-transparent hover:border-[var(--primary)]/30 group"
      >
        <span>Browse Catalog</span>
        <ChevronDown
          className={`h-4 w-4 transition-all duration-300 group-hover:text-[var(--primary)] ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-3 w-[700px] max-w-[95vw] bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          <div className="flex h-[420px]">
            {/* Specialization/Domain Column */}
            <div className="w-1/2 border-r border-[var(--border)] overflow-y-auto bg-gradient-to-b from-[var(--primary)]/5 via-[var(--card)] to-[var(--card)]">
              {/* Header Section */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-[var(--primary)]/10 to-transparent backdrop-blur-sm p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 mb-0.5">
                  <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                  <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">
                    Brand
                  </h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Browse by Brand
                </p>
              </div>

              {/* Categories List */}
              {categoriesQuery.isLoading && (
                <div className="px-4 py-8 text-sm text-[var(--muted-foreground)] flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                  <span>Loading...</span>
                </div>
              )}

              <div className="py-2 px-2">
                {categoriesQuery.data?.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="px-3 py-3 mb-1 cursor-pointer transition-all duration-200 rounded-xl flex items-center justify-between group text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] border border-transparent hover:shadow-lg hover:shadow-[var(--primary)]/20"
                  >
                    <span className="text-sm font-medium truncate">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand/OEM Column */}
            <div className="w-1/2 overflow-y-auto bg-gradient-to-b from-[var(--card)] via-[var(--card)] to-[var(--primary)]/3">
              {/* Header Section */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-[var(--chart-3)]/10 to-transparent backdrop-blur-sm p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 mb-0.5">
                  <Award className="h-4 w-4 text-[var(--chart-3)]" />
                  <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">
                    Application
                  </h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Browse by Application
                </p>
              </div>

              {/* SubCategories List */}
              {subCategoriesQuery.isLoading && (
                <div className="px-4 py-8 text-sm text-[var(--muted-foreground)] flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--chart-3)]" />
                  <span>Loading...</span>
                </div>
              )}

              <div className="py-2 px-2">
                {subCategoriesQuery.data?.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    onClick={() => handleSubCategoryClick(subCategory)}
                    className="px-3 py-3 mb-1 cursor-pointer transition-all duration-200 rounded-xl flex items-center justify-between group text-[var(--foreground)] hover:bg-[var(--chart-3)] hover:text-white border border-transparent hover:shadow-lg hover:shadow-[var(--chart-3)]/20"
                  >
                    <span className="text-sm font-medium truncate">
                      {subCategory.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
