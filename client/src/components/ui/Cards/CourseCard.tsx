import React from "react";

interface CourseCardProps {
  course: any;
  className?: string;
  onCardClick?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className = "",
  onCardClick,
}) => {
  const {
    id,
    title,
    description,
    image,
    category,
    subcategory,
    rating,
    reviewCount,
    updatedAt,
    duration,
    price,
    originalPrice,
  } = course;

  const handleClick = () => {
    onCardClick?.(id);
  };

  // ✅ Format price display
  const getPriceDisplay = (priceValue: number | string): string => {
    const numPrice =
      typeof priceValue === "string" ? parseFloat(priceValue) : priceValue;
    if (numPrice === 0 || isNaN(numPrice)) return "Free";
    return `$${numPrice.toFixed(2)}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 transition-transform duration-300 ${
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
      className={`group relative bg-[var(--card)] rounded-2xl overflow-hidden cursor-pointer ${className} border border-[var(--border)] transition-all duration-500 hover:shadow-2xl hover:border-[var(--primary)]/50`}
      onClick={handleClick}
    >
      {/* Premium Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/0 via-transparent to-[var(--primary)]/0 group-hover:from-[var(--primary)]/10 group-hover:via-transparent group-hover:to-[var(--primary)]/5 transition-all duration-500 pointer-events-none" />

      {/* Image Section with Premium Effects */}
      <div className="relative overflow-hidden m-4 rounded-xl aspect-video bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x225";
          }}
        />
        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 translate-x-full group-hover:translate-x-0 group-hover:animate-shimmer" />

        {/* Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-[var(--primary)] to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          View Value Stream
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 relative z-10">
        {/* Category Tags with Enhanced Hover */}
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] px-3 py-1.5 rounded-full font-medium transition-all duration-300 group-hover:bg-[var(--primary)]/20 group-hover:scale-105 group-hover:shadow-md transform origin-left">
            {category}
          </span>
          <span className="bg-blue-100 text-blue-600 text-[10px] px-3 py-1.5 rounded-full font-medium transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-105 group-hover:shadow-md transform origin-left">
            {subcategory}
          </span>
        </div>

        {/* Title with Enhanced Hover */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-[var(--foreground)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:line-clamp-none">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[var(--muted-foreground)] text-xs mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-[var(--foreground)]/70">
          {description}
        </p>

        {/* Rating and Reviews with Hover Effect */}
        <div className="flex items-center justify-between mb-3 transition-all duration-300 group-hover:scale-105 origin-left">
          <div className="flex items-center space-x-2">
            {renderStars(rating)}
            <span className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors duration-300">
              ({reviewCount})
            </span>
            {/* Duration right after review count */}
            <span className="flex items-center text-sm text-[var(--muted-foreground)] ml-4 transition-all duration-300 group-hover:text-[var(--foreground)] group-hover:translate-x-1">
              <svg
                className="w-4 h-4 mr-1 transition-transform duration-500 group-hover:rotate-45"
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
              {duration || "N/A"}
            </span>
          </div>
        </div>

        {/* Price Section with Premium Styling */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] transition-colors duration-300 group-hover:border-[var(--primary)]/30">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover:text-3xl">
              {getPriceDisplay(price)}
            </span>
            {/* Only show originalPrice if it's a valid discount */}
            {typeof originalPrice === "number" &&
              originalPrice > price &&
              originalPrice > 0 && (
                <span className="text-sm text-[var(--muted-foreground)] line-through transition-colors duration-300 group-hover:text-red-500">
                  ${originalPrice}
                </span>
              )}
          </div>
          <button className="text-xs text-[var(--muted-foreground)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:font-semibold group-hover:scale-110 transform origin-right">
            {updatedAt}
          </button>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
};

export default CourseCard;
