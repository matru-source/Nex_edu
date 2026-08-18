import { useQuery } from "@tanstack/react-query";
import CourseCard from "../Cards/CourseCard";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { Response, CourseWithCategory } from "../../../types";
import { useNavigate } from "react-router-dom";

interface CoursesResponse extends Response {
  data: CourseWithCategory[];
}

export default function CoursesSection() {
  const navigate = useNavigate();

  // ✅ Fetch real courses instead of hardcoded data
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const res = await api.get<CoursesResponse>(
        API_ROUTES.COURSE.GET_TOP_COURSES
      );
      return res.data;
    },
  });

  const handleCardClick = (courseId: string) => {
    navigate(`/public/course/${courseId}`);
  };

  // ✅ Format duration from seconds to readable format
  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds === 0) return "N/A";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // ✅ Format price - show "Free" if 0, otherwise show formatted price
  const formatPrice = (price?: number): number => {
    return price || 0;
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col my-12 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
            Ready to enter the Real Business World?
          </h2>
          <div className="text-[var(--color-muted-foreground)] text-sm">
            Explore and scale up your Business Acumen Skills through the gateways that matches with your knowledge, aspiration and dream
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const courses = coursesData?.data || [];

  if (courses.length === 0) {
    return (
      <div className="w-full flex flex-col my-12 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
            Ready to enter the Real Business World?
          </h2>
          <div className="text-[var(--color-muted-foreground)] text-sm">
            Explore and scale up your Business Acumen Skills through the gateways that matches with your knowledge, aspiration and dream
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          No Value Stream available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col my-12 gap-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
          Ready to enter the Real Business World?
        </h2>
        <div className="text-[var(--color-muted-foreground)] text-sm">
          Explore and scale up your Business Acumen Skills through the gateways that matches with your knowledge, aspiration and dream
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={{
              id: course.id,
              title: course.title,
              description: course.description,
              image:
                course.tumbnailUrl || "https://via.placeholder.com/400x225",
              category: course.category.name,
              subcategory: course.subCategory.name,
              rating: 4.5,
              reviewCount: 0,
              updatedAt: new Date(course.updatedAt).toLocaleDateString(),
              duration: formatDuration(course.totalDuration), // ✅ Use actual duration
              price: formatPrice(course.totalPrice), // ✅ Use actual price
              originalPrice: 0,
              isFeatured: false,
              level: "Beginner" as const,
            }}
            onCardClick={handleCardClick}
            className="mb-4"
          />
        ))}
      </div>
    </div>
  );
}
