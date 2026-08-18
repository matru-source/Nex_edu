import { Folder, ArrowRight } from "lucide-react";
import TopBar from "../../../lazy/TopBar";
import useRouter from "../../../../hooks/useRouter";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response } from "../../../../types";
import { useParams } from "react-router-dom";
import { useState } from "react";

interface Module {
  id: string;
  title: string;
  description: string;
  expertise: {
    skillCategory: {
      course: {
        id: string;
        title: string;
      };
    };
  };
}

interface ModulesResponse extends Response {
  data: Module[];
}

export default function SelectModuleForQuiz() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  useInitNavStackOnce([
    { title: "Quizzes", path: "/admin/quizzes" },
    {
      title: "Create Quiz - Select Module",
      path: `/admin/quiz/create/select-module/${courseId}`,
    },
  ]);

  const modulesQuery = useQuery({
    queryKey: ["modules-for-quiz", courseId],
    queryFn: async () => {
      // We need to get all modules for this course
      // First get skill categories, then expertise, then modules
      const skillCategoriesRes = await api.get(
        API_ROUTES.SKILL_CATEGORY.GET_SKILL_CATEGORIES_BY_COURSE_ID(courseId!)
      );
      const skillCategories = skillCategoriesRes.data.data;

      const allModules: Module[] = [];
      for (const sc of skillCategories) {
        const expertiseRes = await api.get(
          API_ROUTES.EXPERTISE.GET_EXPERTISE_BY_SKILL_CATEGORY_ID(sc.id)
        );
        const expertiseList = expertiseRes.data.data;

        for (const exp of expertiseList) {
          const modulesRes = await api.get<ModulesResponse>(
            API_ROUTES.MODULE.GET_MODULES_BY_EXPERTISE_ID(exp.id)
          );
          allModules.push(...modulesRes.data.data);
        }
      }

      return { data: allModules };
    },
    enabled: !!courseId,
  });

  const handleNext = () => {
    if (selectedModule) {
      router.push(
        `/admin/quiz/create/select-chapter/${selectedModule}`,
        "Select Chapter"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <TopBar />

      <div className="max-w-4xl mx-auto mt-8 px-8 pb-8">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-6 pb-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--ring)]/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center">
                <Folder className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Select Module
                </h1>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Choose the module for your quiz
                </p>
              </div>
            </div>
          </div>

          {/* Module List */}
          <div className="p-6">
            {modulesQuery.isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
                <p className="text-[var(--muted-foreground)] mt-4">
                  Loading modules...
                </p>
              </div>
            ) : modulesQuery.data?.data.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-lg font-medium text-[var(--foreground)]">
                  No modules found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {modulesQuery.data?.data.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedModule === module.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--foreground)] mb-1">
                          {module.title}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {module.description}
                        </p>
                      </div>
                      {selectedModule === module.id && (
                        <div className="ml-4 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--muted)]/20 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedModule}
              className="px-6 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next: Select Chapter
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
