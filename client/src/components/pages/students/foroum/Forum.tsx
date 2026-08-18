import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  FiSearch,
  FiUser,
  FiClock,
  FiMessageSquare,
  FiPlus,
  FiFilter,
} from "react-icons/fi";
import {
  HiOutlineLightBulb,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import TopBar from "../../../lazy/TopBar";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import { userStore } from "../../../../state/global";
import Tabs from "../../../lazy/Tabs";
import useRouter from "../../../../hooks/useRouter";

interface AllQuestionsResponse extends Response {
  data: ({
    user: {
      id: string;
      name: string;
    };
  } & {
    lessonId: string;
    userId: string;
    question: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  })[];
}

export default function Forum() {
  const user = userStore((state) => state.user);
  const myUserId = user?.id || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const router = useRouter();

  const getAllQuestionsQuery = useQuery({
    queryKey: ["get-all-questions"],
    queryFn: async () => {
      const res = await api.get<AllQuestionsResponse>(
        API_ROUTES.FORUM.GET_ALL_QUESTIONS
      );
      return res.data;
    },
  });

  const questions = getAllQuestionsQuery.data?.data || [];

  // Filter questions based on search term and active filter
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (question) =>
          question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active/inactive filter
    if (activeFilter === "active") {
      filtered = filtered.filter((question) => question.isActive);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter((question) => !question.isActive);
    }

    return filtered;
  }, [questions, searchTerm, activeFilter]);

  // Separate my questions and others' questions
  const myQuestions = useMemo(
    () => filteredQuestions.filter((question) => question.userId === myUserId),
    [filteredQuestions, myUserId]
  );

  const othersQuestions = useMemo(
    () => filteredQuestions.filter((question) => question.userId !== myUserId),
    [filteredQuestions, myUserId]
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(date);
  };

  const QuestionCard = ({ question }: { question: (typeof questions)[0] }) => (
    <div
      className="bg-card border border-border rounded-xl p-6 mb-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 group"
      onClick={() => {
        router.push(
          `/question/${question.id}`,
          `${question.question.slice(0, 20)}...`
        );
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg leading-7 group-hover:text-primary transition-colors line-clamp-2">
            {question.question}
          </h3>

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FiUser className="w-4 h-4" />
              <span className="font-medium">{question.user.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              <span>{getTimeAgo(question.createdAt)}</span>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ml-4 ${
            question.isActive
              ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              question.isActive ? "bg-green-500" : "bg-muted-foreground"
            }`}
          ></div>
          {question.isActive ? "Active" : "Closed"}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HiOutlineLightBulb className="w-4 h-4" />
          <span className="text-sm">Click to view discussion</span>
        </div>
        <FiMessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );

  const EmptyState = ({
    type,
    hasSearch,
  }: {
    type: "my" | "all";
    hasSearch: boolean;
  }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <HiOutlineQuestionMarkCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {hasSearch
          ? "No questions found"
          : type === "my"
          ? "You haven't asked any questions yet"
          : "No questions from other users yet"}
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {hasSearch
          ? "Try adjusting your search terms or filters to find what you're looking for."
          : type === "my"
          ? "Start a discussion by asking your first question to get help from the community."
          : "Be the first to start a discussion by asking a question."}
      </p>
      {!hasSearch && type === "my" && (
        <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          <FiPlus className="w-4 h-4" />
          Ask Your First Question
        </button>
      )}
    </div>
  );

  const LoadingState = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-6 animate-pulse"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <div className="w-16 h-6 bg-muted rounded-full ml-4"></div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-20 h-3 bg-muted rounded"></div>
            <div className="w-16 h-3 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  useInitNavStackOnce([{ title: "Forum Discussion", path: "/forum" }]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Search and Filter Bar */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background focus:bg-card input-form"
                  style={{ paddingLeft: "3rem" }}
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors ${
                    activeFilter === "all"
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <FiFilter className="w-4 h-4" />
                  All Questions
                </button>
                <button
                  onClick={() => setActiveFilter("active")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors ${
                    activeFilter === "active"
                      ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter("inactive")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors ${
                    activeFilter === "inactive"
                      ? "bg-muted border-border text-muted-foreground"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  Closed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <Tabs
            tabs={[
              {
                title: `My Questions (${myQuestions.length})`,
                content: (
                  <div className="p-6">
                    {getAllQuestionsQuery.isLoading ? (
                      <LoadingState />
                    ) : getAllQuestionsQuery.error ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HiOutlineQuestionMarkCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Error loading questions
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Please try again later
                        </p>
                        <button
                          onClick={() => getAllQuestionsQuery.refetch()}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : myQuestions.length === 0 ? (
                      <EmptyState
                        type="my"
                        hasSearch={
                          !!searchTerm.trim() || activeFilter !== "all"
                        }
                      />
                    ) : (
                      <div className="space-y-4">
                        {myQuestions.map((question) => (
                          <QuestionCard key={question.id} question={question} />
                        ))}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: `Community Questions (${othersQuestions.length})`,
                content: (
                  <div className="p-6">
                    {getAllQuestionsQuery.isLoading ? (
                      <LoadingState />
                    ) : getAllQuestionsQuery.error ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HiOutlineQuestionMarkCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Error loading questions
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Please try again later
                        </p>
                        <button
                          onClick={() => getAllQuestionsQuery.refetch()}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : othersQuestions.length === 0 ? (
                      <EmptyState
                        type="all"
                        hasSearch={
                          !!searchTerm.trim() || activeFilter !== "all"
                        }
                      />
                    ) : (
                      <div className="space-y-4">
                        {othersQuestions.map((question) => (
                          <QuestionCard key={question.id} question={question} />
                        ))}
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
