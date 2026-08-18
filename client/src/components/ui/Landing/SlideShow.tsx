import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";

interface Banner {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
}

interface BannersResponse {
  status: boolean;
  data?: Banner[];
}

interface SlideShowProps {
  autoPlay?: boolean;
  interval?: number;
}

// Fallback slides when no banners from API
const fallbackSlides = [
  {
    id: "default-1",
    imageUrl: "/banner.png",
    title: "",
    description: null,
    order: 0,
    isActive: true,
  },
];

export default function SlideShow({
  autoPlay = true,
  interval = 5000,
}: SlideShowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch banners from API
  const { data: bannersData } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await api.get<BannersResponse>(API_ROUTES.BANNER.LIST);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const slides = bannersData?.data?.length ? bannersData.data : fallbackSlides;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (slides.length === 0) {
    return (
      <div className="w-full h-64 bg-[var(--color-muted)] flex items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">
          No slides to display
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto group">
      {/* Slides Container */}
      <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl bg-[var(--color-card)]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title || `Banner ${index + 1}`}
              className="w-full h-full object-cover brightness-90"
            />
            {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

            {/* Banner Content (Optional) */}
            {(slide.title || slide.description) && (
              <div className="absolute bottom-16 left-8 md:left-16 max-w-2xl text-white">
                {slide.title && (
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-lg transform transition-all duration-700 translate-y-0 opacity-100">
                    {slide.title}
                  </h2>
                )}
                {slide.description && (
                  <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-xl">
                    {slide.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-20">
          <div
            key={currentSlide} // Key change forces animation reset
            className="h-full bg-primary origin-left"
            style={{
              animation: `progress ${interval}ms linear`,
            }}
          />
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 right-8 flex space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
