import React from "react";
import type { CourseWithCategory as Course } from "../../../types";

interface CourseCardProps {
  course: Course & { totalPrice?: number; totalDuration?: number };
  className?: string;
  onCardClick?: (courseId: string) => void;
}

const StudentCourseCard: React.FC<CourseCardProps> = ({
  course,
  className = "",
  onCardClick,
}) => {
  const {
    id,
    title,
    description,
    tumbnailUrl = "https://via.placeholder.com/400x225",
    updatedAt,
    category,
    subCategory,
    totalPrice = 0,
    totalDuration = 0,
  } = course;

  const handleClick = () => {
    onCardClick?.(id);
  };

  // ✅ Format duration from seconds to readable format
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return "N/A";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // ✅ Format price
  const formatPrice = (price: number): string => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-[var(--muted-foreground)]">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`bg-[var(--card)] rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className} border border-[var(--border)]`}
      onClick={handleClick}
    >
      {/* Image Section - ✅ Fixed aspect ratio */}
      <div className="relative overflow-hidden m-4 rounded-xl aspect-video bg-muted">
        <img
          src={tumbnailUrl || "https://via.placeholder.com/400x225"}
          alt={title}
          className="w-full h-full object-cover"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x225";
          }}
        />
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] px-2 py-1 rounded">
            {category.name}
          </span>
          <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] px-2 py-1 rounded">
            {subCategory.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[var(--muted-foreground)] text-xs mb-3 line-clamp-2">
          {description}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {renderStars(4.5)}
            <span className="text-sm text-[var(--muted-foreground)]">(0)</span>
          </div>
        </div>

        {/* Duration - ✅ Show actual duration */}
        <div className="flex items-center text-sm text-[var(--muted-foreground)] mb-3">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatDuration(totalDuration)}
        </div>

        {/* Price Section - ✅ Show actual price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[var(--foreground)]">
            {formatPrice(totalPrice)}
          </span>
          <button className="text-xs text-[var(--muted-foreground)] transition-colors">
            Updated {`${new Date(updatedAt).toLocaleDateString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseCard;
