import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import Tabs from "../../lazy/Tabs";
import {
  MessageSquare,
  Trash2,
  Loader2,
  Inbox,
  Send,
  Ban,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
  Calendar,
  BookOpen,
  Shield,
  AlertTriangle,
  Check,
  Filter,
  Search,
  Layers,
} from "lucide-react";
import type { Response } from "../../../types";

interface FaqUser {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
}

interface FaqReply {
  id: string;
  reply: string;
  isAdminReply: boolean;
  isActive: boolean;
  createdAt: string;
  user: FaqUser;
}

interface FaqQuestion {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
  user: FaqUser;
  lesson: {
    id: string;
    title: string;
    chapter: {
      id: string;
      title: string;
      module: {
        id: string;
        title: string;
        expertise: {
          id: string;
          name: string;
          skillCategory: {
            id: string;
            name: string;
            course: {
              id: string;
              title: string;
            };
          };
        };
      };
    };
  };
  replies: FaqReply[];
}

interface FaqBlock {
  id: string;
  userId: string;
  lessonId?: string;
  courseId?: string;
  reason?: string;
  blockedBy: string;
  createdAt: string;
  user: FaqUser;
  lesson?: {
    id: string;
    title: string;
    chapter: {
      title: string;
      module: {
        expertise: {
          skillCategory: {
            course: { id: string; title: string };
          };
        };
      };
    };
  };
}

interface FaqStats {
  totalQuestions: number;
  todayQuestions: number;
  totalReplies: number;
  blockedUsers: number;
  adminReplies: number;
}

interface QuestionsResponse extends Response {
  data: FaqQuestion[];
}

interface BlocksResponse extends Response {
  data: FaqBlock[];
}

interface StatsResponse extends Response {
  data: FaqStats;
}

// Helper function
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCourseFromQuestion = (question: FaqQuestion) => {
  return question.lesson.chapter.module.expertise.skillCategory.course;
};

// QuestionCard component - EXTRACTED OUTSIDE to prevent re-creation on parent re-render
function QuestionCard({
  question,
  selectedCourse,
  onDeleteQuestion,
  onDeleteReply,
  onCreateReply,
  onBlockUser,
  isDeleteQuestionPending,
  isDeleteReplyPending,
  isCreateReplyPending,
}: {
  question: FaqQuestion;
  selectedCourse: string | null;
  onDeleteQuestion: (id: string) => void;
  onDeleteReply: (id: string) => void;
  onCreateReply: (questionId: string, reply: string) => void;
  onBlockUser: (userId: string, userName: string, lessonId: string, courseId: string) => void;
  isDeleteQuestionPending: boolean;
  isDeleteReplyPending: boolean;
  isCreateReplyPending: boolean;
}) {
  // Local state for this card - prevents parent re-renders from affecting focus
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const course = getCourseFromQuestion(question);
  const isInactive = !question.isActive;

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onCreateReply(question.id, replyText.trim());
      setReplyText("");
      setIsReplying(false);
    }
  };

  return (
    <div
      className={`bg-[var(--card)] border rounded-xl overflow-hidden transition-all ${
        isInactive ? "border-red-300 dark:border-red-900 opacity-60" : "border-[var(--border)]"
      }`}
    >
      {/* Question Header */}
      <div
        className="p-4 cursor-pointer hover:bg-[var(--muted)]/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[var(--foreground)] font-medium mb-2 line-clamp-2">
              {isInactive && (
                <span className="text-red-500 text-xs mr-2">[DELETED]</span>
              )}
              {question.question}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {question.user.name}
              </span>
              <span className="text-[var(--border)]">•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {question.lesson.title}
              </span>
              <span className="text-[var(--border)]">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(question.createdAt)}
              </span>
            </div>
            {!selectedCourse && (
              <div className="mt-2">
                <span className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-xs">
                  {course.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {question.replies.length > 0 && (
              <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-xs font-medium">
                {question.replies.length} {question.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-[var(--border)] p-4 bg-[var(--muted)]/20">
          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              Reply as Admin
            </button>
            {question.isActive && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this question?")) {
                    onDeleteQuestion(question.id);
                  }
                }}
                disabled={isDeleteQuestionPending}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
              >
                {isDeleteQuestionPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={() => onBlockUser(question.user.id, question.user.name, question.lesson.id, course.id)}
              className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              <Ban className="w-4 h-4" />
              Block User
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mb-4 p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your admin reply..."
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSubmitReply}
                  disabled={isCreateReplyPending || !replyText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
                >
                  {isCreateReplyPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText("");
                  }}
                  className="px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Replies List */}
          {question.replies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[var(--foreground)]">Replies</h4>
              {question.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-3 rounded-lg border ${
                    reply.isAdminReply
                      ? "bg-[var(--primary)]/5 border-[var(--primary)]/30"
                      : !reply.isActive
                      ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900 opacity-60"
                      : "bg-[var(--card)] border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-[var(--foreground)]">
                          {reply.user.name}
                        </span>
                        {reply.isAdminReply && (
                          <span className="px-2 py-0.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-xs font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {!reply.isActive && (
                          <span className="text-red-500 text-xs">[DELETED]</span>
                        )}
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground)]">{reply.reply}</p>
                    </div>
                    {reply.isActive && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this reply?")) {
                            onDeleteReply(reply.id);
                          }
                        }}
                        disabled={isDeleteReplyPending}
                        className="p-1.5 text-[var(--muted-foreground)] hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {isDeleteReplyPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminFaq() {
  useInitNavStackOnce([{ title: "FAQ Management", path: "/admin/faq" }]);
  const queryClient = useQueryClient();

  // State for hierarchy navigation
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  // State for block modal
  const [blockModal, setBlockModal] = useState<{ userId: string; userName: string; lessonId: string; courseId: string } | null>(null);
  const [blockScope, setBlockScope] = useState<"lesson" | "course">("lesson");
  const [blockReason, setBlockReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const questionsQuery = useQuery({
    queryKey: ["faq-admin-questions"],
    queryFn: async () => {
      const res = await api.get<QuestionsResponse>(API_ROUTES.FAQ_ADMIN.GET_ALL_QUESTIONS);
      return res.data;
    },
  });

  const blocksQuery = useQuery({
    queryKey: ["faq-admin-blocks"],
    queryFn: async () => {
      const res = await api.get<BlocksResponse>(API_ROUTES.FAQ_ADMIN.GET_BLOCKS);
      return res.data;
    },
  });

  const statsQuery = useQuery({
    queryKey: ["faq-admin-stats"],
    queryFn: async () => {
      const res = await api.get<StatsResponse>(API_ROUTES.FAQ_ADMIN.GET_STATS);
      return res.data;
    },
  });

  // Organize questions by hierarchy
  const hierarchy = useMemo(() => {
    const questions = questionsQuery.data?.data || [];
    const courses: Record<string, { 
      id: string; 
      title: string; 
      chapters: Record<string, { 
        id: string; 
        title: string; 
        lessons: Record<string, { 
          id: string; 
          title: string; 
          questions: FaqQuestion[] 
        }> 
      }> 
    }> = {};

    questions.forEach(q => {
      const course = q.lesson.chapter.module.expertise.skillCategory.course;
      const chapter = q.lesson.chapter;
      const lesson = q.lesson;

      if (!courses[course.id]) {
        courses[course.id] = { id: course.id, title: course.title, chapters: {} };
      }
      if (!courses[course.id].chapters[chapter.id]) {
        courses[course.id].chapters[chapter.id] = { id: chapter.id, title: chapter.title, lessons: {} };
      }
      if (!courses[course.id].chapters[chapter.id].lessons[lesson.id]) {
        courses[course.id].chapters[chapter.id].lessons[lesson.id] = { id: lesson.id, title: lesson.title, questions: [] };
      }
      courses[course.id].chapters[chapter.id].lessons[lesson.id].questions.push(q);
    });

    return courses;
  }, [questionsQuery.data?.data]);

  // Mutations
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(API_ROUTES.FAQ_ADMIN.DELETE_QUESTION(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["faq-admin-stats"] });
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(API_ROUTES.FAQ_ADMIN.DELETE_REPLY(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["faq-admin-stats"] });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async ({ questionId, reply }: { questionId: string; reply: string }) => {
      return api.post(API_ROUTES.FAQ_ADMIN.CREATE_ADMIN_REPLY, { questionId, reply });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["faq-admin-stats"] });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (data: { userId: string; lessonId?: string; courseId?: string; reason?: string }) => {
      return api.post(API_ROUTES.FAQ_ADMIN.BLOCK_USER, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-admin-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["faq-admin-stats"] });
      setBlockModal(null);
      setBlockReason("");
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(API_ROUTES.FAQ_ADMIN.UNBLOCK_USER(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-admin-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["faq-admin-stats"] });
    },
  });

  // Filter questions based on hierarchy selection and search
  const filteredQuestions = useMemo(() => {
    let questions = questionsQuery.data?.data || [];

    // Filter by hierarchy
    if (selectedCourse) {
      questions = questions.filter(q => getCourseFromQuestion(q).id === selectedCourse);
    }
    if (selectedChapter) {
      questions = questions.filter(q => q.lesson.chapter.id === selectedChapter);
    }
    if (selectedLesson) {
      questions = questions.filter(q => q.lesson.id === selectedLesson);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      questions = questions.filter(q =>
        q.question.toLowerCase().includes(term) ||
        q.user.name.toLowerCase().includes(term) ||
        q.user.email.toLowerCase().includes(term)
      );
    }

    return questions;
  }, [questionsQuery.data?.data, selectedCourse, selectedChapter, selectedLesson, searchTerm]);

  const stats = statsQuery.data?.data;
  const blocks = blocksQuery.data?.data || [];

  // Get chapters for selected course
  const availableChapters = useMemo(() => {
    if (!selectedCourse || !hierarchy[selectedCourse]) return [];
    return Object.values(hierarchy[selectedCourse].chapters);
  }, [hierarchy, selectedCourse]);

  // Get lessons for selected chapter
  const availableLessons = useMemo(() => {
    if (!selectedCourse || !selectedChapter || !hierarchy[selectedCourse]?.chapters[selectedChapter]) return [];
    return Object.values(hierarchy[selectedCourse].chapters[selectedChapter].lessons);
  }, [hierarchy, selectedCourse, selectedChapter]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">FAQ Management</h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Moderate lesson questions, reply as admin, and manage user blocks
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.totalQuestions || 0}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Total Questions</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.todayQuestions || 0}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Today</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.totalReplies || 0}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Total Replies</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.adminReplies || 0}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Admin Replies</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.blockedUsers || 0}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Blocked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            <Tabs
              tabs={[
                {
                  title: `Questions (${questionsQuery.data?.data?.length || 0})`,
                  content: (
                    <div className="p-6">
                      {/* Hierarchy Navigator */}
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Layers className="w-5 h-5 text-[var(--primary)]" />
                          <h3 className="font-semibold text-[var(--foreground)]">Filter by Location</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Course Selector */}
                          <div>
                            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Value Stream</label>
                            <select
                              value={selectedCourse || ""}
                              onChange={(e) => {
                                setSelectedCourse(e.target.value || null);
                                setSelectedChapter(null);
                                setSelectedLesson(null);
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            >
                              <option value="">All Value Streams</option>
                              {Object.values(hierarchy).map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                              ))}
                            </select>
                          </div>

                          {/* Chapter Selector */}
                          <div>
                            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Chapter</label>
                            <select
                              value={selectedChapter || ""}
                              onChange={(e) => {
                                setSelectedChapter(e.target.value || null);
                                setSelectedLesson(null);
                              }}
                              disabled={!selectedCourse}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                            >
                              <option value="">All Chapters</option>
                              {availableChapters.map(chapter => (
                                <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
                              ))}
                            </select>
                          </div>

                          {/* Lesson Selector */}
                          <div>
                            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">Lesson</label>
                            <select
                              value={selectedLesson || ""}
                              onChange={(e) => setSelectedLesson(e.target.value || null)}
                              disabled={!selectedChapter}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                            >
                              <option value="">All Lessons</option>
                              {availableLessons.map(lesson => (
                                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Breadcrumb */}
                        {(selectedCourse || selectedChapter || selectedLesson) && (
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                            <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="text-sm text-[var(--muted-foreground)]">Showing:</span>
                            <div className="flex items-center gap-1 text-sm">
                              {selectedCourse && (
                                <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                                  {hierarchy[selectedCourse]?.title}
                                </span>
                              )}
                              {selectedCourse && selectedChapter && (
                                <>
                                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                    {hierarchy[selectedCourse]?.chapters[selectedChapter]?.title}
                                  </span>
                                </>
                              )}
                              {selectedCourse && selectedChapter && selectedLesson && (
                                <>
                                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                                    {hierarchy[selectedCourse]?.chapters[selectedChapter]?.lessons[selectedLesson]?.title}
                                  </span>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedCourse(null);
                                setSelectedChapter(null);
                                setSelectedLesson(null);
                              }}
                              className="ml-auto text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                            >
                              Clear filters
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Questions List */}
                      <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                          <input
                            type="text"
                            placeholder="Search questions or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                        </div>

                        {questionsQuery.isLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                          </div>
                        ) : filteredQuestions.length === 0 ? (
                          <div className="text-center py-12">
                            <Inbox className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
                            <p className="text-[var(--muted-foreground)]">
                              {searchTerm || selectedCourse ? "No questions match your filters" : "No questions yet"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                            </p>
                            {filteredQuestions.map((question) => (
                              <QuestionCard
                                key={question.id}
                                question={question}
                                selectedCourse={selectedCourse}
                                onDeleteQuestion={(id) => deleteQuestionMutation.mutate(id)}
                                onDeleteReply={(id) => deleteReplyMutation.mutate(id)}
                                onCreateReply={(questionId, reply) => createReplyMutation.mutate({ questionId, reply })}
                                onBlockUser={(userId, userName, lessonId, courseId) => setBlockModal({ userId, userName, lessonId, courseId })}
                                isDeleteQuestionPending={deleteQuestionMutation.isPending}
                                isDeleteReplyPending={deleteReplyMutation.isPending}
                                isCreateReplyPending={createReplyMutation.isPending}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  title: `Blocked Users (${blocks.length})`,
                  content: (
                    <div className="p-6">
                      <div className="space-y-4">
                        {blocksQuery.isLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                          </div>
                        ) : blocks.length === 0 ? (
                          <div className="text-center py-12">
                            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-[var(--muted-foreground)]">No blocked users</p>
                          </div>
                        ) : (
                          blocks.map((block) => {
                            const courseName = block.lesson
                              ? block.lesson.chapter.module.expertise.skillCategory.course.title
                              : "All lessons in course";

                            return (
                              <div
                                key={block.id}
                                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                      <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-[var(--foreground)]">{block.user.name}</p>
                                      <p className="text-sm text-[var(--muted-foreground)]">{block.user.email}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span
                                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            block.lessonId
                                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                          }`}
                                        >
                                          {block.lessonId ? "Lesson Block" : "Course Block"}
                                        </span>
                                        {block.lessonId && block.lesson && (
                                          <span className="text-xs text-[var(--muted-foreground)]">
                                            {block.lesson.title}
                                          </span>
                                        )}
                                        {block.courseId && (
                                          <span className="text-xs text-[var(--muted-foreground)]">{courseName}</span>
                                        )}
                                      </div>
                                      {block.reason && (
                                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                          Reason: {block.reason}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                      {formatDate(block.createdAt)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        if (confirm("Unblock this user?")) {
                                          unblockUserMutation.mutate(block.id);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                    >
                                      Unblock
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Block User Modal */}
      {blockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Block User</h3>
            </div>

            <p className="text-[var(--muted-foreground)] mb-4">
              Block <span className="font-medium text-[var(--foreground)]">{blockModal.userName}</span> from
              commenting
            </p>

            {/* Block Scope Selection */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--muted)]/30 transition-colors">
                <input
                  type="radio"
                  name="blockScope"
                  checked={blockScope === "lesson"}
                  onChange={() => setBlockScope("lesson")}
                  className="w-4 h-4 text-[var(--primary)]"
                />
                <div>
                  <p className="font-medium text-[var(--foreground)]">This Lesson Only</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    User can still comment on other lessons
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--muted)]/30 transition-colors">
                <input
                  type="radio"
                  name="blockScope"
                  checked={blockScope === "course"}
                  onChange={() => setBlockScope("course")}
                  className="w-4 h-4 text-[var(--primary)]"
                />
                <div>
                  <p className="font-medium text-[var(--foreground)]">Entire Course</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    User cannot comment on any lesson in this course
                  </p>
                </div>
              </label>
            </div>

            {/* Block Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  blockUserMutation.mutate({
                    userId: blockModal.userId,
                    ...(blockScope === "lesson" ? { lessonId: blockModal.lessonId } : { courseId: blockModal.courseId }),
                    reason: blockReason || undefined,
                  });
                }}
                disabled={blockUserMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {blockUserMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                Block User
              </button>
              <button
                onClick={() => {
                  setBlockModal(null);
                  setBlockReason("");
                }}
                className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
