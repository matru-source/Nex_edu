import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Play,
  ChevronRight,
  Award,
  Layers,
  FolderOpen,
  Video,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Tag,
} from "lucide-react";
import { formatDuration as baseFormatDuration } from "../../../../utils/formatDuration";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  categoryName?: string;
  subCategoryName?: string;
  totalChapters?: number;
  totalLessons?: number;
  totalDuration?: number;
  price?: number;
  priceCategory?: "FREE" | "TRIAL" | "PAID";
  isEnrolled?: boolean;
  progress?: number;
  onClick?: () => void;
  onContinue?: () => void;
}

export interface SkillCategoryCardProps {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string | null;
  expertiseCount?: number;
  progress?: number;
  onClick?: () => void;
}

export interface ExpertiseCardProps {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string | null;
  skillCategoryName?: string;
  moduleCount?: number;
  totalDuration?: number;
  onClick?: () => void;
}

export interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  expertiseName?: string;
  chapterCount?: number;
  estimatedTime?: number;
  levels?: ('LEARNER' | 'PRACTITIONER' | 'PROFESSIONAL')[];
  onClick?: () => void;
}

export interface ChapterCardProps {
  id: string;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  price?: number;
  lessonCount?: number;
  completionPercentage?: number;
  isPurchased?: boolean;
  onClick?: () => void;
}

export interface LessonCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  chapterName?: string;
  duration?: number;
  isCompleted?: boolean;
  onClick?: () => void;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return "0s";
  return baseFormatDuration(seconds);
};

const getPriceBadge = (priceCategory?: string, price?: number) => {
  switch (priceCategory) {
    case "FREE":
      return {
        text: "Free",
        className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      };
    case "TRIAL":
      return {
        text: "Free Trial",
        className: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
      };
    case "PAID":
      return {
        text: price ? `$${price}` : "Paid",
        className: "bg-primary/20 text-primary",
      };
    default:
      return null;
  }
};

// ============================================
// COURSE CARD - PREMIUM DESIGN
// ============================================

export function CourseCard({
  title,
  description,
  thumbnailUrl,
  categoryName,
  totalChapters = 0,
  totalDuration = 0,
  priceCategory,
  price,
  isEnrolled = false,
  progress = 0,
  onClick,
  onContinue,
}: CourseCardProps) {
  const priceBadge = getPriceBadge(priceCategory, price);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col h-96 bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-primary/50"
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-primary/5 transition-all duration-500 pointer-events-none z-0" />

      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary/20" />
          </div>
        )}

        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 translate-x-full group-hover:translate-x-0 group-hover:animate-shimmer" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Price Badge */}
        {priceBadge && (
          <div
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md ${priceBadge.className} shadow-lg transform transition-all duration-300 group-hover:scale-110 origin-top-right`}
          >
            {priceBadge.text}
          </div>
        )}

        {/* Enrolled Badge */}
        {isEnrolled && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/90 text-primary-foreground flex items-center gap-1.5 backdrop-blur-md shadow-lg transform transition-all duration-300 group-hover:scale-110 origin-top-left">
            <Sparkles className="w-3 h-3" />
            Enrolled
          </div>
        )}

        {/* Play Button on Hover - Slide Up */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/0 flex items-center justify-center shadow-lg transform transition-all duration-500 group-hover:bg-primary/80 group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100">
            <Play
              className="w-7 h-7 text-primary-foreground ml-1"
              fill="currentColor"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 relative z-10 justify-between">
        {/* Category Badge */}
        {categoryName && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 w-fit px-2.5 py-1 rounded-lg mb-2 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-md">
            <Tag className="w-3 h-3" />
            <span className="truncate">{categoryName}</span>
          </span>
        )}

        {/* Title */}
        <h3 className="font-bold text-sm leading-snug mb-2 text-card-foreground line-clamp-2 transition-all duration-300 group-hover:text-primary">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {description}
        </p>

        {/* Stats Row - Compact */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 py-2 px-2 bg-muted/30 rounded-lg transition-all duration-300 group-hover:bg-muted/60">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <FolderOpen className="w-3 h-3 flex-shrink-0" />
            {totalChapters}
          </span>

          <span className="w-px h-3 bg-border/50" />
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {formatDuration(totalDuration)}
          </span>
        </div>

        {/* Progress Bar (if enrolled) */}
        {isEnrolled && (
          <div className="mb-3 py-2 px-2 bg-muted/20 rounded-lg">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground font-medium">
                Progress
              </span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full transition-all duration-700 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-border/50">
          {isEnrolled && onContinue ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContinue();
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-primary py-2 px-3 rounded-lg hover:bg-primary/10 transition-all duration-300 group-hover:translate-y-0 translate-y-1 opacity-0 group-hover:opacity-100"
            >
              Continue Learning
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="flex items-center justify-center gap-1 text-xs font-bold text-primary py-2 group-hover:gap-2 transition-all duration-300">
              View Value Stream
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

// ============================================
// SKILL CATEGORY CARD - PREMIUM DESIGN
// ============================================

export function SkillCategoryCard({
  name,
  description,
  thumbnailUrl,
  expertiseCount = 0,
  progress = 0,
  onClick,
}: SkillCategoryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col h-96 w-72 min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-primary/50 flex-shrink-0"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chart-1/0 via-transparent to-chart-1/0 group-hover:from-chart-1/5 group-hover:via-transparent group-hover:to-chart-1/5 transition-all duration-500 pointer-events-none z-0" />

      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-chart-1/10 to-chart-2/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:-rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="w-12 h-12 text-chart-1/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Expertise Count Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg transform transition-all duration-300 group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100">
          <TrendingUp className="w-3 h-3" />
          {expertiseCount} Domains
        </div>

        {/* Pulse Effect */}
        <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 scale-0 group-hover:animate-pulse-glow" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 relative z-10 justify-between">
        {/* Title */}
        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-card-foreground transition-all duration-300 group-hover:text-chart-1 mb-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {description}
        </p>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-3 py-2 px-2 bg-muted/30 rounded-lg transition-all duration-300 group-hover:bg-muted/50">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground font-medium">
                Completed
              </span>
              <span className="font-bold text-chart-1">{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-chart-1 to-chart-2 rounded-full transition-all duration-700 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action */}
        <div className="pt-2 border-t border-border/50">
          <span className="flex items-center justify-center gap-1 text-xs font-bold text-chart-1 py-2 group-hover:gap-2 transition-all duration-300">
            Explore Domains
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-chart-1 via-chart-2/60 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

// ============================================
// EXPERTISE CARD - PREMIUM DESIGN
// ============================================

export function ExpertiseCard({
  name,
  description,
  thumbnailUrl,
  skillCategoryName,
  moduleCount = 0,
  totalDuration = 0,
  onClick,
}: ExpertiseCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col h-96 w-72 min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-primary/50 flex-shrink-0"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chart-3/0 via-transparent to-chart-3/0 group-hover:from-chart-3/5 group-hover:via-transparent group-hover:to-chart-3/5 transition-all duration-500 pointer-events-none z-0" />

      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-chart-3/10 to-chart-4/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Award className="w-12 h-12 text-chart-3/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Parent Badge */}
        {skillCategoryName && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-md truncate max-w-[calc(100%-24px)] shadow-lg transform transition-all duration-300 group-hover:scale-105 origin-top-left">
            {skillCategoryName}
          </div>
        )}

        {/* Corner Accent */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 relative z-10 justify-between">
        {/* Title */}
        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-card-foreground transition-all duration-300 group-hover:text-chart-3 mb-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground py-2 px-2 bg-muted/30 rounded-lg mb-3 transition-all duration-300 group-hover:bg-muted/50">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Layers className="w-3 h-3 flex-shrink-0" />
            {moduleCount}
          </span>
          <span className="w-px h-3 bg-border/50" />
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {formatDuration(totalDuration)}
          </span>
        </div>

        {/* Action */}
        <div className="pt-2 border-t border-border/50">
          <span className="flex items-center justify-center gap-1 text-xs font-bold text-chart-3 py-2 group-hover:gap-2 transition-all duration-300">
            View Domain
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-chart-3 via-chart-4/60 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

// ============================================
// MODULE CARD - PREMIUM DESIGN
// ============================================

export function ModuleCard({
  title,
  description,
  thumbnailUrl,
  expertiseName,
  chapterCount = 0,
  estimatedTime = 0,
  levels = [],
  onClick,
}: ModuleCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col h-96 w-72 min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-primary/50 flex-shrink-0"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/0 via-transparent to-chart-4/0 group-hover:from-chart-4/5 group-hover:via-transparent group-hover:to-chart-4/5 transition-all duration-500 pointer-events-none z-0" />

      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-chart-4/10 to-chart-5/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="w-12 h-12 text-chart-4/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Parent Badge */}
        {expertiseName && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-md truncate max-w-[calc(100%-24px)] shadow-lg transform transition-all duration-300 group-hover:translate-y-0 -translate-y-8 opacity-0 group-hover:opacity-100">
            {expertiseName}
          </div>
        )}

        {/* Level Badges */}
        {levels.length > 0 && (
          <div className="absolute bottom-2 right-2 flex gap-1 flex-wrap justify-end">
            {levels.map((level) => (
              <span
                key={level}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                  level === 'LEARNER'
                    ? 'bg-emerald-500/90 text-white'
                    : level === 'PRACTITIONER'
                    ? 'bg-amber-500/90 text-white'
                    : 'bg-purple-500/90 text-white'
                }`}
              >
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 relative z-10 justify-between">
        {/* Title */}
        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-card-foreground transition-all duration-300 group-hover:text-chart-4 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground py-2 px-2 bg-muted/30 rounded-lg transition-all duration-300 group-hover:bg-muted/50">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            {chapterCount}
          </span>
          <span className="w-px h-3 bg-border/50" />
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {formatDuration(estimatedTime)}
          </span>
        </div>

        {/* Action */}
        <div className="pt-2 border-t border-border/50">
          <span className="flex items-center justify-center gap-1 text-xs font-bold text-chart-4 py-2 group-hover:gap-2 transition-all duration-300">
            View Module
            <ChevronRight className="w-4 h-4 text-chart-4 mx-auto" />
          </span>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-chart-4 via-chart-5/60 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

// ============================================
// CHAPTER CARD - COMPACT PREMIUM DESIGN
// ============================================

export function ChapterCard({
  title,
  content,
  thumbnailUrl,
  price = 0,
  completionPercentage = 0,
  isPurchased = false,
  onClick,
}: ChapterCardProps) {
  const isFree = price === 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex h-24 bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-400 cursor-pointer hover:border-primary/50"
    >
      {/* Thumbnail */}
      <div className="relative w-28 flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125 group-hover:-rotate-3"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary/20" />
          </div>
        )}

        {/* Completed Badge */}
        {completionPercentage === 100 && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary animate-bounce" />
          </div>
        )}

        {/* Shimmer on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 translate-x-full group-hover:translate-x-0 group-hover:animate-shimmer" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-between p-3 min-w-0 gap-3">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-sm text-card-foreground line-clamp-1 transition-colors duration-300 group-hover:text-primary">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {content}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">

            {completionPercentage > 0 && completionPercentage < 100 && (
              <span className="flex items-center gap-1 font-medium text-primary">
                {completionPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Price Badge */}
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ${
              isFree
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/30"
                : isPurchased
                ? "bg-primary/20 text-primary group-hover:bg-primary/30"
                : "bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/30"
            }`}
          >
            {isFree ? "Free" : isPurchased ? "Owned" : `$${price}`}
          </div>

          {/* Action Button */}
          <button className="flex items-center text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:translate-x-1">
            {isPurchased || isFree ? "Go" : "Buy"}
            <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Progress Bar Overlay */}
      {completionPercentage > 0 && completionPercentage < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}

      {/* Hover Indicator Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    </div>
  );
}

// ============================================
// CHAPTER CARD - VERTICAL PREMIUM DESIGN
// ============================================

export function ChapterCardVertical({
  title,
  content,
  thumbnailUrl,
  price = 0,
  completionPercentage = 0,
  isPurchased = false,
  onClick,
}: ChapterCardProps) {
  const isFree = price === 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col h-96 w-72 min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-primary/50 flex-shrink-0"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Thumbnail Section */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors duration-500">
            <Layers className="w-12 h-12 text-indigo-400/50 group-hover:text-indigo-500/70 transition-colors duration-500" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-20">
           <div
            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${
              isFree
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-100"
                : isPurchased
                ? "bg-primary/20 border-primary/30 text-primary-foreground"
                : "bg-amber-500/20 border-amber-500/30 text-amber-100"
            }`}
          >
            {isFree ? "Free" : isPurchased ? "Owned" : `$${price}`}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5 relative z-20">
        <div className="flex-1 space-y-3">
          <h3 className="font-bold text-lg text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {content}
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">

        </div>

         {/* Call to Action */}
        <div className="pt-2">
          <span className="flex items-center justify-center gap-1 text-xs font-bold text-primary py-2 group-hover:gap-2 transition-all duration-300">
            {isPurchased || isFree ? "Start Learning" : "Unlock Chapter"}
            <ChevronRight className="w-4 h-4 text-primary mx-auto" />
          </span>
        </div>
      </div>

       {/* Progress Bar Overlay */}
      {completionPercentage > 0 && completionPercentage < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30 overflow-hidden z-30">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-30" />
    </div>
  );
}

// ============================================
// LESSON CARD - VERTICAL PREMIUM DESIGN
// ============================================

export function LessonCardVertical({
  title,
  thumbnailUrl,
  chapterName,
  duration = 0,
  isCompleted = false,
  onClick,
}: LessonCardProps) {
  return (
     <div
      onClick={onClick}
      className="group relative flex flex-col h-96 w-72 min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-primary/50 flex-shrink-0"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Thumbnail Section */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500/10 to-orange-500/10 group-hover:from-rose-500/20 group-hover:to-orange-500/20 transition-colors duration-500">
            <Video className="w-12 h-12 text-rose-400/50 group-hover:text-rose-500/70 transition-colors duration-500" />
          </div>
        )}

         {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
           <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 z-20">
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 text-xs font-bold backdrop-blur-md shadow-lg flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </div>
          </div>
        )}
      </div>

       {/* Content Section */}
      <div className="flex flex-col flex-1 p-5 relative z-20">
        <div className="flex-1 space-y-3">
           {chapterName && (
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
              {chapterName}
            </span>
          )}
          <h3 className="font-bold text-lg text-card-foreground line-clamp-3 leading-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
        </div>

         {/* Footer Info */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
           <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-2">
          <span className="flex items-center justify-center gap-1 text-xs font-bold text-primary py-2 group-hover:gap-2 transition-all duration-300">
            {isCompleted ? "Watch Again" : "Start Lesson"}
            <ChevronRight className="w-4 h-4 text-primary mx-auto" />
          </span>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-30" />
    </div>
  );
}

// ============================================
// LESSON CARD - COMPACT PREMIUM DESIGN
// ============================================

export function LessonCard({
  title,
  thumbnailUrl,
  chapterName,
  duration = 0,
  isCompleted = false,
  onClick,
}: LessonCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center gap-3 h-20 bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-400 cursor-pointer hover:border-primary/50"
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-5 h-5 text-primary/20" />
          </div>
        )}

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Play className="w-5 h-5 text-white" fill="currentColor" />
        </div>

        {/* Completed Checkmark */}
        {isCompleted && (
          <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Chapter Name */}
        {chapterName && (
          <span className="text-xs text-muted-foreground truncate block mb-1 font-medium">
            {chapterName}
          </span>
        )}

        {/* Title */}
        <h3 className="font-semibold text-sm text-card-foreground line-clamp-1 transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>

        {/* Duration */}
        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1 group-hover:text-primary/70 transition-colors">
          <Clock className="w-3 h-3" />
          {formatDuration(duration)}
        </span>
      </div>

      {/* Status / Action */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Play
              className="w-4 h-4 text-primary group-hover:text-primary-foreground"
              fill="currentColor"
            />
          </div>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    </div>
  );
}

// ============================================
// COMPACT LESSON LIST ITEM
// ============================================

export function LessonListItem({
  title,
  duration = 0,
  isCompleted = false,
  onClick,
}: Omit<LessonCardProps, "thumbnailUrl" | "chapterName">) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 py-2.5 px-3 hover:bg-muted/50 rounded-lg transition-all duration-300 cursor-pointer"
    >
      {/* Status Icon */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          isCompleted
            ? "bg-emerald-500/20"
            : "bg-muted group-hover:bg-primary/20"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Play
            className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary"
            fill="currentColor"
          />
        )}
      </div>

      {/* Title */}
      <span
        className={`flex-1 text-sm truncate transition-colors duration-300 ${
          isCompleted
            ? "text-muted-foreground"
            : "text-card-foreground group-hover:text-primary"
        }`}
      >
        {title}
      </span>

      {/* Duration */}
      <span className="text-xs text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors duration-300">
        {formatDuration(duration)}
      </span>
    </div>
  );
}

// ============================================
// SECTION HEADER COMPONENT
// ============================================

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onAction,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          {actionText}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// HORIZONTAL SCROLL CONTAINER WITH NAV
// ============================================

export function HorizontalScrollContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePages = () => {
      if (containerRef.current) {
        const total = Math.ceil(
          containerRef.current.scrollWidth / containerRef.current.clientWidth
        );
        setTotalPages(total || 1);
        setCurrentPage(Math.round(containerRef.current.scrollLeft / containerRef.current.clientWidth));
      }
    };

    calculatePages();
    window.addEventListener("resize", calculatePages);
    return () => window.removeEventListener("resize", calculatePages);
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const scrollAmount = containerRef.current.clientWidth;
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    containerRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  const goToPage = (pageIndex: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: pageIndex * containerRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollPosition(target.scrollLeft);
    const page = Math.round(target.scrollLeft / target.clientWidth);
    setCurrentPage(page);
  };

  // Calculate if we can scroll
  const canScrollLeft = currentPage > 0;
  const canScrollRight = currentPage < totalPages - 1;

  return (
    <div className="relative group pb-16">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {children}
      </div>

      {/* Navigation Controls - Carousel Indicators at Bottom */}
      {totalPages > 1 && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-6 mt-8">
          {/* Left Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              scroll("left");
            }}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full border transition-all duration-300 flex items-center justify-center shadow-sm ${
              canScrollLeft
                ? "bg-card border-border hover:border-primary text-foreground hover:text-primary cursor-pointer"
                : "bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed opacity-50"
            }`}
            aria-label="Previous"
          >
            ←
          </button>

          {/* Dot Indicators - Sliding Window */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            {(() => {
              const maxDots = 7;
              let start = 0;
              let end = totalPages;

              if (totalPages > maxDots) {
                start = Math.max(0, Math.min(currentPage - 3, totalPages - maxDots));
                end = start + maxDots;
              }

              return Array.from({ length: end - start }).map((_, i) => {
                const pageIndex = start + i;
                return (
                  <button
                    key={pageIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      goToPage(pageIndex);
                    }}
                    className={`transition-all duration-300 rounded-full flex-shrink-0 ${
                      pageIndex === currentPage
                        ? "w-8 h-3 bg-primary"
                        : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`Page ${pageIndex + 1}`}
                  />
                );
              });
            })()}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              scroll("right");
            }}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full border transition-all duration-300 flex items-center justify-center shadow-sm ${
              canScrollRight
                ? "bg-card border-border hover:border-primary text-foreground hover:text-primary cursor-pointer"
                : "bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed opacity-50"
            }`}
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// CARD SKELETON LOADERS
// ============================================

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col h-96 bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-40 bg-muted" />
      <div className="flex-1 p-4 space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-16 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
        </div>
        <div className="h-8 w-full bg-muted rounded-lg" />
        <div className="h-6 w-full bg-muted rounded" />
      </div>
    </div>
  );
}

export function SkillCategoryCardSkeleton() {
  return (
    <div className="flex flex-col h-96 w-72 min-w-0 bg-card border border-border rounded-2xl overflow-hidden animate-pulse flex-shrink-0">
      <div className="h-40 bg-muted" />
      <div className="flex-1 p-4 space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
        </div>
        <div className="h-8 w-full bg-muted rounded-lg" />
        <div className="h-6 w-full bg-muted rounded" />
      </div>
    </div>
  );
}

export function ChapterCardSkeleton() {
  return (
    <div className="flex h-24 bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="w-28 bg-muted" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
      </div>
    </div>
  );
}

export function LessonCardSkeleton() {
  return (
    <div className="flex items-center gap-3 h-20 bg-card border border-border rounded-xl p-3 animate-pulse">
      <div className="w-16 h-16 bg-muted rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-12 bg-muted rounded" />
      </div>
      <div className="w-8 h-8 bg-muted rounded-full" />
    </div>
  );
}
