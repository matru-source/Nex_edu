import { useState, useCallback, useRef } from "react";
import { API_ROUTES } from "../lib/api";

export interface SearchedCourse {
    id: string;
    title: string;
    description: string;
    tumbnailUrl?: string;
    category: {
        name: string;
    };
    subCategory: {
        name: string;
    };
}

export interface SearchResponse {
    success: boolean;
    message: string;
    data: {
        courses: SearchedCourse[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalResults: number;
            resultsPerPage: number;
        };
    };
}

export default function useSearchCourses() {
    const [results, setResults] = useState<SearchedCourse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const searchCourses = useCallback(
        async (query: string, category?: string, sortBy?: string, page: number = 1) => {
            if (!query.trim()) {
                setResults([]);
                setHasSearched(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            setHasSearched(true);

            try {
                const params = new URLSearchParams({
                    query: query.trim(),
                    page: page.toString(),
                    limit: "10",
                });

                if (category) params.append("category", category);
                if (sortBy) params.append("sortBy", sortBy);

                const response = await fetch(`${API_ROUTES.COURSE.SEARCH}?${params.toString()}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch search results");
                }

                const data: SearchResponse = await response.json();

                if (data.success) {
                    setResults(data.data.courses);
                } else {
                    setError(data.message || "No courses found");
                    setResults([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const debouncedSearch = useCallback(
        (query: string, category?: string, sortBy?: string) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                searchCourses(query, category, sortBy);
            }, 300); // 300ms debounce delay
        },
        [searchCourses]
    );

    return {
        results,
        isLoading,
        error,
        hasSearched,
        searchCourses,
        debouncedSearch,
    };
}