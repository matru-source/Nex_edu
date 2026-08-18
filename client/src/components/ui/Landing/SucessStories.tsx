import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";

interface SuccessStory {
  id: string;
  name: string;
  achievement: string;
  story: string;
  image: string | null;
  duration: string;
}

interface SuccessStoriesResponse {
  status: boolean;
  data: SuccessStory[];
}

const SuccessStories: React.FC = () => {
  const { data: storiesData } = useQuery({
    queryKey: ["student-stories"],
    queryFn: async () => {
      const res = await api.get<SuccessStoriesResponse>(API_ROUTES.STUDENT_STORIES.LIST);
      return res.data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });

  const firstRowRef = useRef<HTMLDivElement>(null);

  const stories = storiesData?.data || [];
  
  // Ensure we have enough items for smoother scrolling by duplicating if needed
  // If we have very few items, duplicate them more times
  let displayStories = [...stories];
  if (displayStories.length > 0) {
    while (displayStories.length < 10) {
      displayStories = [...displayStories, ...stories];
    }
    // One final duplication for the loop connection
    displayStories = [...displayStories, ...displayStories];
  } else {
    // Fallback if no data yet (don't show empty section or show placeholders)
    return null;
  }

  const StoryCard: React.FC<{ story: SuccessStory }> = ({ story }) => (
    <div className="flex-shrink-0 w-80 bg-[var(--color-card)]/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mx-4 transform hover:scale-105 transition-all duration-300 border border-[var(--color-border)]/20 hover:shadow-2xl group">
      <div className="flex items-center mb-4">
        <div className="mr-4 group-hover:scale-110 transition-transform duration-300">
          <Avatar className="h-14 w-14 border-2 border-[var(--color-primary)]/20">
            <AvatarImage src={story.image || ""} alt={story.name} />
            <AvatarFallback className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-lg font-semibold">
              {story.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-[var(--color-foreground)] mb-0.5 truncate">
            {story.name}
          </h3>
          <p className="text-[var(--color-chart-1)] font-semibold text-xs mb-1 truncate">
            {story.achievement}
          </p>
          <span className="text-[10px] text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-0.5 rounded-full inline-block">
            {story.duration}
          </span>
        </div>
      </div>
      <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed line-clamp-4 min-h-[5rem]">
        {story.story}
      </p>
      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Verified Success
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-yellow-400 text-sm">
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-[var(--color-background)] overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xl text-[var(--color-muted-foreground)] max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who transformed their careers through our
            learning platform
          </p>
        </div>

        {/* Single Row - Moving Right */}
        <div className="relative">
          <div
            ref={firstRowRef}
            className="flex space-x-8"
            style={{
              animation: "scrollRight 60s linear infinite",
              width: "fit-content",
            }}
          >
            {displayStories.map((story, index) => (
              <StoryCard key={`${story.id}-${index}`} story={story} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-chart-1)] text-[var(--color-primary-foreground)] px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Start Your Success Story
          </button>
        </div>
      </div>
    </section>
  );
};


export default SuccessStories;
