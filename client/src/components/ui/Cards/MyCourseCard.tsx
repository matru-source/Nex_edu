import { BookOpen, ArrowRight } from "lucide-react";
import type { CourseWithCategory } from "../../../types";

interface MyCoursesCardProps {
  course: CourseWithCategory;
  onCardClick: (courseId: string) => void;
}

export default function MyCoursesCard({
  course,
  onCardClick,
}: MyCoursesCardProps) {
  const thumbnailUrl =
    course.tumbnailUrl || "https://via.placeholder.com/400x225";

  return (
    <div
      className="group relative bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden 
                 hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 cursor-pointer"
      onClick={() => onCardClick(course.id)}
    >
      {/* Course Thumbnail */}
      <div className="relative aspect-video bg-[var(--muted)] overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x225";
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="text-white text-sm font-medium">View Course</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--foreground)] mb-1 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
              {course.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <span>{course.category.name}</span>
              <span>•</span>
              <span>{course.subCategory.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
