import { useState } from "react";
import TopBar from "../../../../components/lazy/TopBar";
import ContinueWatching from "../../../ui/Dashboard/ContinueWatching";
import PurchasedChapters from "../../../ui/Courses/PurchasedChapters";
import { BookOpen, Play, Zap, Library } from "lucide-react";

type TabType = "continue-watching" | "my-chapters";

export default function Courses() {
  const [activeTab, setActiveTab] = useState<TabType>("continue-watching");

  return (
    <div className="w-full bg-[var(--background)] min-h-screen">
      <TopBar />

      <div className="p-6 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 rounded-lg">
              <BookOpen className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                Your Learning Journey
              </h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                Track your progress and continue where you left off
              </p>
            </div>
          </div>
        </div>

        {/* Premium Tabs */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row border-b border-[var(--border)]">
            {/* Continue Watching Tab */}
            <button
              onClick={() => setActiveTab("continue-watching")}
              className={`flex-1 px-4 py-3 md:py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 relative overflow-hidden group ${
                activeTab === "continue-watching"
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {activeTab === "continue-watching" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-[var(--primary)]/5 -z-10 animate-pulse"></div>
              )}
              <div
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  activeTab === "continue-watching"
                    ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] group-hover:bg-[var(--muted)]/50"
                }`}
              >
                <Play size={16} />
              </div>
              <span>Continue Watching</span>
              {activeTab === "continue-watching" && (
                <div className="ml-auto hidden md:block">
                  <Zap size={16} className="text-[var(--primary)]" />
                </div>
              )}
            </button>

            {/* My Chapters Tab */}
            <button
              onClick={() => setActiveTab("my-chapters")}
              className={`flex-1 px-4 py-3 md:py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 relative overflow-hidden group border-t md:border-t-0 md:border-l border-[var(--border)] ${
                activeTab === "my-chapters"
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {activeTab === "my-chapters" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-[var(--primary)]/5 -z-10 animate-pulse"></div>
              )}
              <div
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  activeTab === "my-chapters"
                    ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] group-hover:bg-[var(--muted)]/50"
                }`}
              >
                <Library size={16} />
              </div>
              <span>My Chapters</span>
              {activeTab === "my-chapters" && (
                <div className="ml-auto hidden md:block">
                  <Zap size={16} className="text-[var(--primary)]" />
                </div>
              )}
            </button>
          </div>

          {/* Tab Content with smooth transition */}
          <div className="p-6 md:p-10 min-h-screen">
            {activeTab === "continue-watching" && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ContinueWatching />
              </div>
            )}
            {activeTab === "my-chapters" && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                <PurchasedChapters />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
