import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { Play, ChevronRight } from "lucide-react";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";

export default function BentoSection() {
  const navigate = useNavigate();

  // Fetch free lessons for the carousel
  const { data: lessonsData, isLoading: loadingLessons } = useQuery({
    queryKey: ["bento-free-lessons"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_FREE_LESSONS);
      return res.data.data ?? [];
    },
  });

  const lessons = lessonsData || [];
  const [lessonIndex, setLessonIndex] = useState(0);

  // Auto-slide effect for carousel
  useEffect(() => {
    if (lessons.length <= 1) return;
    const interval = setInterval(() => {
      setLessonIndex((prev) => (prev + 1) % lessons.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [lessons.length]);

  return (
    <div className="py-16 bg-[var(--color-background)] p-8 gap-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          <div className="bg-[var(--color-card)] rounded-xl shadow overflow-hidden flex items-center justify-center col-span-2">
            <img src="/image.png" alt="" className="w-full h-full object-cover" />
          </div>

          {/* Lessons Carousel Section */}
          <div className="col-span-1 bg-[var(--color-card)] rounded-xl shadow p-6 flex flex-col gap-4 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                  <Play className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-foreground)]">
                    Latest Lessons
                  </h3>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Pick up where you left off
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Content */}
            <div className="flex-1 relative">
              {loadingLessons ? (
                <div className="w-full h-full bg-[var(--color-muted)] rounded-xl animate-pulse" />
              ) : lessons.length > 0 ? (
                <div
                  className="h-full flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${lessonIndex * 100}%)` }}
                >
                  {lessons.map((lesson: any) => {
                    const courseId = lesson.chapter?.module?.expertise?.skillCategory?.course?.id;
                    return (
                      <div
                        key={lesson.id}
                        className="w-full h-full flex-shrink-0 cursor-pointer p-1"
                        onClick={() => courseId && navigate(`/public/course/${courseId}`)}
                      >
                        <div className="bg-[var(--color-muted)]/30 rounded-xl overflow-hidden h-full flex flex-col border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={lesson.tumbnailUrl || lesson.chapter?.tumbnailUrl || "/placeholder-course.jpg"}
                              alt={lesson.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 text-white fill-current" />
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                                {lesson.chapter?.title}
                              </span>
                              <h4 className="text-md font-bold text-[var(--color-foreground)] mt-2 line-clamp-2">
                                {lesson.title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-xs text-[var(--color-muted-foreground)]">
                                {lesson.video?.[0]?.duration ? `${Math.floor(lesson.video[0].duration / 60)} mins` : 'Lesson'}
                              </span>
                              <ChevronRight className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[var(--color-muted-foreground)] text-sm">
                  No lessons available
                </div>
              )}
            </div>

            {/* Indicators */}
            {!loadingLessons && lessons.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {lessons.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setLessonIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === lessonIndex ? "w-4 bg-[var(--color-primary)]" : "bg-[var(--color-muted-foreground)]/30"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* bottom section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {/* card normal */}
          <div className="col-span-1 bg-[var(--color-card)] rounded-xl shadow p-6 flex flex-col gap-4">
            <div className="w-full h-full rounded-xl overflow-hidden">
              <img
                src="https://cdn.dribbble.com/userupload/3908884/file/original-e321c84726acfae829e24304a4b6c04b.jpg?resize=1024x768&vertical=center"
                alt=""
                className="object-cover h-full"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  Articles Available
                </p>
                <h3 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                  1,200+
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  In-depth guides
                </p>
              </div>
              <div className="p-3 bg-[var(--color-secondary)] rounded-lg w-fit">
                <DocumentTextIcon className="w-8 h-8 text-[var(--color-secondary-foreground)]" />
              </div>
            </div>
          </div>
          {/* card wide */}
          <div className="bg-[var(--color-card)] rounded-xl shadow grid grid-cols-2 justify-between items-end col-span-2">
            <div className="flex flex-col p-6 justify-between h-full gap-6">
              <div className="w-full h-full overflow-hidden rounded-xl">
                <img src="/image copy.png" alt="Discussions" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  Forum Discussions
                </p>
                <h3 className="text-5xl font-bold text-[var(--color-primary)] mb-2">
                  25,000+
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Active Community
                </p>
              </div>
            </div>
            <div className="w-full h-full flex justify-end items-end">
              <img src="/forum.png" alt="" className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
