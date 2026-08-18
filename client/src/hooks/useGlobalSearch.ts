import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "../lib/api";
import api from "../lib/axios/axios";

export interface GlobalSearchResult {
    type: "course" | "module" | "expertise" | "chapter" | "lesson" | "skillCategory";
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    courseId: string;
    courseName: string;
    parentInfo?: string;
}

export interface GroupedResults {
    courses: GlobalSearchResult[];
    skillCategories: GlobalSearchResult[];
    modules: GlobalSearchResult[];
    expertise: GlobalSearchResult[];
    chapters: GlobalSearchResult[];
    lessons: GlobalSearchResult[];
}

const EMPTY_RESULTS: GroupedResults = {
    courses: [],
    skillCategories: [],
    modules: [],
    expertise: [],
    chapters: [],
    lessons: [],
};

// Helper to normalize and match search terms (case-insensitive, partial match)
function matchesSearch(text: string | undefined | null, query: string): boolean {
    if (!text || !query) return false;
    return text.toLowerCase().includes(query.toLowerCase());
}

// Pre-fetch and cache all entities for instant search
function useCachedEntities() {
    const { data: skillCategories = [] } = useQuery({
        queryKey: ["global-search-skill-categories"],
        queryFn: async () => {
            const res = await api.get(API_ROUTES.COURSE.PUBLIC_SKILL_CATEGORIES_ALL);
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        gcTime: 10 * 60 * 1000,
    });

    const { data: modules = [] } = useQuery({
        queryKey: ["global-search-modules"],
        queryFn: async () => {
            const res = await api.get(API_ROUTES.COURSE.PUBLIC_MODULES_ALL);
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const { data: expertise = [] } = useQuery({
        queryKey: ["global-search-expertise"],
        queryFn: async () => {
            const res = await api.get(API_ROUTES.COURSE.PUBLIC_EXPERTISE_ALL);
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const { data: chapters = [] } = useQuery({
        queryKey: ["global-search-chapters"],
        queryFn: async () => {
            const res = await api.get(API_ROUTES.COURSE.PUBLIC_CHAPTERS_ALL);
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const { data: lessons = [] } = useQuery({
        queryKey: ["global-search-lessons"],
        queryFn: async () => {
            const res = await api.get(API_ROUTES.COURSE.PUBLIC_LESSONS_ALL);
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const { data: courses = [] } = useQuery({
        queryKey: ["global-search-courses"],
        queryFn: async () => {
            const res = await api.get(API_ROUTES.COURSE.GET_TOP_COURSES);
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    return { skillCategories, modules, expertise, chapters, lessons, courses };
}

export default function useGlobalSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastQueryRef = useRef<string>("");

    // Get cached entities
    const { skillCategories, modules, expertise, chapters, lessons, courses } = useCachedEntities();

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Debounced search with proper cleanup
    const debouncedSearch = useCallback((query: string) => {
        setSearchQuery(query);

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        const trimmedQuery = query.trim();

        // Immediate clear if empty
        if (!trimmedQuery) {
            setDebouncedQuery("");
            setIsSearching(false);
            return;
        }

        // Start loading indicator immediately for responsiveness
        setIsSearching(true);

        // Debounce the actual search - shorter delay for better UX
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedQuery(trimmedQuery);
            setIsSearching(false);
            lastQueryRef.current = trimmedQuery;
        }, 200); // Reduced from 350ms to 200ms for snappier feel
    }, []);

    // Compute results based on debounced query (instant client-side filtering)
    const results: GroupedResults = (() => {
        const query = debouncedQuery.trim().toLowerCase();

        if (!query || query.length < 2) {
            return EMPTY_RESULTS;
        }

        // Filter courses - search in title and description
        const filteredCourses: GlobalSearchResult[] = courses
            .filter((c: any) =>
                matchesSearch(c.title, query) ||
                matchesSearch(c.description, query)
            )
            .slice(0, 5)
            .map((c: any) => ({
                type: "course" as const,
                id: c.id,
                title: c.title,
                description: c.description,
                thumbnailUrl: c.tumbnailUrl,
                courseId: c.id,
                courseName: c.title,
                parentInfo: c.category?.name,
            }));

        // Filter skill categories - search in name and description
        const filteredSkillCategories: GlobalSearchResult[] = skillCategories
            .filter((sc: any) =>
                matchesSearch(sc.name, query) ||
                matchesSearch(sc.description, query)
            )
            .slice(0, 5)
            .map((sc: any) => ({
                type: "skillCategory" as const,
                id: sc.id,
                title: sc.name,
                description: sc.description,
                thumbnailUrl: sc.tumbnailUrl,
                courseId: sc.course?.id || "",
                courseName: sc.course?.title || "",
                parentInfo: sc.course?.title,
            }));

        // Filter modules - search in title and description
        const filteredModules: GlobalSearchResult[] = modules
            .filter((m: any) =>
                matchesSearch(m.title, query) ||
                matchesSearch(m.description, query)
            )
            .slice(0, 5)
            .map((m: any) => ({
                type: "module" as const,
                id: m.id,
                title: m.title,
                description: m.description,
                thumbnailUrl: m.tumbnailUrl,
                courseId: m.expertise?.skillCategory?.course?.id || "",
                courseName: m.expertise?.skillCategory?.course?.title || "",
                parentInfo: `${m.expertise?.skillCategory?.name || ""} › ${m.expertise?.name || ""}`,
            }));

        // Filter expertise - search in name and description
        const filteredExpertise: GlobalSearchResult[] = expertise
            .filter((e: any) =>
                matchesSearch(e.name, query) ||
                matchesSearch(e.description, query)
            )
            .slice(0, 5)
            .map((e: any) => ({
                type: "expertise" as const,
                id: e.id,
                title: e.name,
                description: e.description,
                thumbnailUrl: e.tumbnailUrl,
                courseId: e.skillCategory?.course?.id || "",
                courseName: e.skillCategory?.course?.title || "",
                parentInfo: e.skillCategory?.name,
            }));

        // Filter chapters - search in title and content
        const filteredChapters: GlobalSearchResult[] = chapters
            .filter((ch: any) =>
                matchesSearch(ch.title, query) ||
                matchesSearch(ch.content, query)
            )
            .slice(0, 5)
            .map((ch: any) => ({
                type: "chapter" as const,
                id: ch.id,
                title: ch.title,
                description: ch.content,
                thumbnailUrl: ch.tumbnailUrl,
                courseId: ch.module?.expertise?.skillCategory?.course?.id || "",
                courseName: ch.module?.expertise?.skillCategory?.course?.title || "",
                parentInfo: ch.module?.title,
            }));

        // Filter lessons - search in title and content
        const filteredLessons: GlobalSearchResult[] = lessons
            .filter((l: any) =>
                matchesSearch(l.title, query) ||
                matchesSearch(l.content, query)
            )
            .slice(0, 5)
            .map((l: any) => ({
                type: "lesson" as const,
                id: l.id,
                title: l.title,
                description: l.content,
                thumbnailUrl: l.tumbnailUrl,
                courseId: l.chapter?.module?.expertise?.skillCategory?.course?.id || "",
                courseName: l.chapter?.module?.expertise?.skillCategory?.course?.title || "",
                parentInfo: l.chapter?.title,
            }));

        return {
            courses: filteredCourses,
            skillCategories: filteredSkillCategories,
            modules: filteredModules,
            expertise: filteredExpertise,
            chapters: filteredChapters,
            lessons: filteredLessons,
        };
    })();

    const totalResults =
        results.courses.length +
        results.skillCategories.length +
        results.modules.length +
        results.expertise.length +
        results.chapters.length +
        results.lessons.length;

    const hasSearched = debouncedQuery.length >= 2;

    // Clear search
    const clearSearch = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        setSearchQuery("");
        setDebouncedQuery("");
        setIsSearching(false);
    }, []);

    return {
        results,
        isLoading: isSearching,
        hasSearched,
        totalResults,
        searchQuery,
        debouncedSearch,
        clearSearch,
        // Legacy API compatibility
        error: null,
        searchAll: debouncedSearch,
    };
}
