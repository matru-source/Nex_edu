import { BookOpen, FileText, ArrowRight } from "lucide-react";
import TopBar from "../../../lazy/TopBar";
import useRouter from "../../../../hooks/useRouter";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import { useState } from "react";

type LocationType = "chapter" | "lesson" | null;

export default function SelectQuizLocation() {
  useInitNavStackOnce([
    { title: "Quizzes", path: "/admin/quizzes" },
    { title: "Create Quiz", path: "/admin/quiz/create" },
  ]);

  const router = useRouter();
  const [selected, setSelected] = useState<LocationType>(null);

  const handleNext = () => {
    if (selected === "chapter") {
      router.push("/admin/courses", "Select Course for Chapter Quiz");
    } else if (selected === "lesson") {
      router.push("/admin/courses", "Select Course for Lesson Quiz");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TopBar />

      <div className="max-w-4xl mx-auto mt-16 px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create New Quiz
          </h1>
          <p className="text-lg text-gray-600">
            Choose where you want to create this quiz
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Chapter Quiz Card */}
          <button
            onClick={() => setSelected("chapter")}
            className={`group relative p-8 rounded-2xl transition-all duration-300 border-2 ${
              selected === "chapter"
                ? "border-cyan-500 bg-white shadow-xl"
                : "border-gray-200 bg-white hover:border-cyan-300 shadow-sm hover:shadow-lg"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={32} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-left">
                Chapter Quiz
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed text-left mb-6">
                Create a quiz that will be linked to an entire chapter. This is
                ideal for comprehensive chapter assessments.
              </p>

              {selected === "chapter" && (
                <div className="flex items-center gap-2 text-cyan-600 font-semibold">
                  <span>Selected</span>
                  <div className="w-2 h-2 bg-cyan-600 rounded-full" />
                </div>
              )}
            </div>
          </button>

          {/* Lesson Quiz Card */}
          <button
            onClick={() => setSelected("lesson")}
            className={`group relative p-8 rounded-2xl transition-all duration-300 border-2 ${
              selected === "lesson"
                ? "border-purple-500 bg-white shadow-xl"
                : "border-gray-200 bg-white hover:border-purple-300 shadow-sm hover:shadow-lg"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText size={32} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-left">
                Lesson Quiz
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed text-left mb-6">
                Create a quiz for a specific lesson. This is ideal for focused
                assessments on particular topics.
              </p>

              {selected === "lesson" && (
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <span>Selected</span>
                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!selected}
            className="px-8 py-3 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
