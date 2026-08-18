import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import NavBar from "../ui/Landing/NavBar";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import type { Course } from "../../types";
import CourseCard from "../ui/Cards/CourseCard";

interface CoursesResponse {
  success: boolean;
  data: Course[];
}

export default function SubCategoryCourses() {
  const { subCategoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { categoryName?: string; subCategoryName?: string };
  };

  const coursesQuery = useQuery({
    queryKey: ["subcategory-courses", subCategoryId],
    queryFn: async () => {
      const res = await api.get<CoursesResponse>(
        API_ROUTES.COURSE.GET_COURSES,
        {
          params: { subCategoryId },
        }
      );
      return res.data.data || [];
    },
    enabled: !!subCategoryId,
  });

  const handleCardClick = (courseId: string) => {
    navigate(`/public/course/${courseId}`);
  };

  const subName = location.state?.subCategoryName || "Subcategory";
  const catName = location.state?.categoryName || "Category";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-[var(--muted-foreground)]">{catName}</p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {subName}
          </h1>
        </div>

        {coursesQuery.isLoading && (
          <div className="text-[var(--muted-foreground)]">
            Loading courses...
          </div>
        )}
        {!coursesQuery.isLoading && coursesQuery.data?.length === 0 && (
          <div className="text-[var(--muted-foreground)]">
            No courses found in this subcategory.
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {coursesQuery.data?.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                title: course.title,
                description: course.description,
                image: course.tumbnailUrl || "/placeholder-course.jpg",
                category: course.category?.name,
                subcategory: course.subCategory?.name,
                rating: 4.8,
                reviewCount: 120,
                updatedAt: course.updatedAt,
                duration: course.totalDuration || 0,
                price: course.totalPrice || 0,
              }}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
