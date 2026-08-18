import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Lessons, Response, Video } from "../../../../types";
import type { CreateLessonQuestionRequestParams } from "../../../../types/zod";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import { userStore } from "../../../../state/global";
import {
  FiMessageSquare,
  FiPlus,
  FiX,
  FiLoader,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiShield,
  FiTrash2,
  FiSlash,
} from "react-icons/fi";

interface FaqReply {
  id: string;
  reply: string;
  isAdminReply: boolean;
  isActive: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    role?: string;
    profilePhoto?: string;
  };
}

interface FaqQuestion {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessonId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  replies: FaqReply[];
}

interface FaqByLessonIdResponse extends Response {
  data: FaqQuestion[];
}

interface BlockCheckResponse extends Response {
  data: {
    blocked: boolean;
    blockType?: string;
    reason?: string;
  };
}

function FaqItem({
  faq,
  isAdmin,
  onBlockUser,
  onDeleteQuestion,
  onDeleteReply,
  onCreateAdminReply,
  isReplyPending,
}: {
  faq: FaqQuestion;
  isAdmin: boolean;
  onBlockUser: (userId: string, userName: string) => void;
  onDeleteQuestion: (id: string) => void;
  onDeleteReply: (id: string) => void;
  onCreateAdminReply: (
    data: { questionId: string; reply: string },
    options?: any
  ) => void;
  isReplyPending: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onCreateAdminReply(
        { questionId: faq.id, reply: replyText.trim() },
        {
          onSuccess: () => {
            setIsReplying(false);
            setReplyText("");
          },
        }
      );
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card hover:shadow-sm transition-all duration-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-muted transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-medium pr-4 line-clamp-2">
            {faq.question}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1.5 text-sm text-muted-foreground">
              <FiUser className="w-3.5 h-3.5" />
              <span>{faq.user.name}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-sm text-muted-foreground">
              <FiCalendar className="w-3.5 h-3.5" />
              <span>
                {new Date(faq.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {faq.replies.length > 0 && (
              <span className="px-2 py-0.5 bg-muted rounded text-xs">
                {faq.replies.length}{" "}
                {faq.replies.length === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          {isExpanded ? (
            <FiChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-4 border-t border-border pt-4">
          {/* Admin Actions */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReplying(!isReplying);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <FiSend className="w-3.5 h-3.5" />
                <span>Reply as Admin</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this question?")) {
                    onDeleteQuestion(faq.id);
                  }
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBlockUser(faq.user.id, faq.user.name);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
              >
                <FiSlash className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>
            </div>
          )}

          {/* Admin Reply Form */}
          {isAdmin && isReplying && (
            <div className="mb-4 p-4 bg-muted rounded-lg border border-border">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your admin reply..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleReplySubmit}
                  disabled={isReplyPending || !replyText.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isReplyPending ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                  <span>Submit</span>
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText("");
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {faq.replies && faq.replies.length > 0 ? (
            <div className="space-y-3">
              {faq.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-lg ${
                    reply.isAdminReply
                      ? "bg-primary/5 border-2 border-primary/30"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground text-sm">
                        {reply.user.name}
                      </span>
                      {reply.isAdminReply && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs font-medium">
                          <FiShield className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this reply?")) {
                            onDeleteReply(reply.id);
                          }
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-foreground leading-relaxed">{reply.reply}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-muted-foreground leading-relaxed">
                This question is waiting for answers. Check back later or
                contribute by answering other questions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Faq({
  currentLesson,
  courseId,
}: {
  currentLesson: Lessons & { Video: Video[] };
  courseId?: string;
}) {
  const queryClient = useQueryClient();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [blockModal, setBlockModal] = useState<{ userId: string; userName: string } | null>(null);
  const [blockScope, setBlockScope] = useState<"lesson" | "course">("lesson");
  const [blockReason, setBlockReason] = useState("");
  const user = userStore((state) => state.user);
  
  const isAdmin = user?.role === "ADMIN";

  const createQuestionFormMutation = useMutation({
    mutationFn: async (data: CreateLessonQuestionRequestParams) => {
      const res = await api.post(API_ROUTES.FORUM.CREATE_LESSON_QUESTION, data);
      return res.data;
    },
    onSuccess: () => {
      setQuestionText("");
      setShowQuestionForm(false);
      getFaqByLessonIdQuery.refetch();
    },
    onError: (error) => {
      console.error("Error creating question:", error);
    },
  });

  const getFaqByLessonIdQuery = useQuery({
    queryKey: ["get-faq-by-lesson-id", currentLesson.id],
    queryFn: async () => {
      const res = await api.get<FaqByLessonIdResponse>(
        API_ROUTES.FORUM.GET_FAQ_BY_LESSON_ID(currentLesson.id)
      );
      return res.data;
    },
  });

  // Check if user is blocked for this lesson
  const blockCheckQuery = useQuery({
    queryKey: ["faq-block-check", currentLesson.id, user?.id],
    queryFn: async () => {
      const res = await api.get<BlockCheckResponse>(
        `${API_ROUTES.FAQ_ADMIN.CHECK_BLOCKED}?userId=${user?.id}&lessonId=${currentLesson.id}`
      );
      return res.data;
    },
    enabled: !!user?.id && !isAdmin, // Admins don't need block check
  });

  // Admin mutations
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(API_ROUTES.FAQ_ADMIN.DELETE_QUESTION(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-faq-by-lesson-id", currentLesson.id] });
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(API_ROUTES.FAQ_ADMIN.DELETE_REPLY(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-faq-by-lesson-id", currentLesson.id] });
    },
  });

  const createAdminReplyMutation = useMutation({
    mutationFn: async ({ questionId, reply }: { questionId: string; reply: string }) => {
      return api.post(API_ROUTES.FAQ_ADMIN.CREATE_ADMIN_REPLY, { questionId, reply });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-faq-by-lesson-id", currentLesson.id] });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (data: { userId: string; lessonId?: string; courseId?: string; reason?: string }) => {
      return api.post(API_ROUTES.FAQ_ADMIN.BLOCK_USER, data);
    },
    onSuccess: () => {
      setBlockModal(null);
      setBlockReason("");
    },
  });

  const isBlocked = blockCheckQuery.data?.data?.blocked || false;
  const blockReasonText = blockCheckQuery.data?.data?.reason;

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !user?.id) return;

    createQuestionFormMutation.mutate({
      lessonId: currentLesson.id,
      userId: user.id,
      question: questionText.trim(),
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm mt-6 overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <FiMessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Lesson Questions
              </h3>
              <p className="text-sm text-muted-foreground">
                Get help and share knowledge
                {isAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                    Admin Mode
                  </span>
                )}
              </p>
            </div>
          </div>

          {user && !isBlocked && !isAdmin && (
            <button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {showQuestionForm ? (
                <>
                  <FiX className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  <span>Ask Question</span>
                </>
              )}
            </button>
          )}
          {user && isBlocked && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg">
              <FiAlertCircle className="w-4 h-4" />
              <span className="text-sm">You are blocked from posting{blockReasonText ? `: ${blockReasonText}` : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Create question form */}
        {showQuestionForm && (
          <div className="mb-8 p-6 bg-muted rounded-xl border border-border">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-1.5 bg-secondary/50 rounded-lg">
                <FiUser className="w-4 h-4 text-secondary-foreground" />
              </div>
              <h4 className="font-medium text-foreground">Ask a Question</h4>
            </div>

            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label
                  htmlFor="question"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Your Question
                </label>
                <textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="What would you like to know about this lesson? Be specific to get better answers..."
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200 bg-background shadow-sm text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={
                    createQuestionFormMutation.isPending || !questionText.trim()
                  }
                  className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {createQuestionFormMutation.isPending ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                  <span>
                    {createQuestionFormMutation.isPending
                      ? "Submitting..."
                      : "Submit Question"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          {getFaqByLessonIdQuery.isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <FiLoader className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="mt-3 text-muted-foreground font-medium">
                Loading questions...
              </p>
              <p className="text-sm text-muted-foreground">
                Please wait a moment
              </p>
            </div>
          )}

          {getFaqByLessonIdQuery.error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 bg-destructive/10 rounded-full mb-3">
                <FiAlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-destructive font-medium">
                Unable to load questions
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please check your connection and try again
              </p>
              <button
                onClick={() => getFaqByLessonIdQuery.refetch()}
                className="mt-4 px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {getFaqByLessonIdQuery.data?.data &&
            getFaqByLessonIdQuery.data.data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <FiMessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-muted-foreground font-medium mb-2">
                  No questions yet
                </h4>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Be the first to ask a question about this lesson and help
                  others learn.
                </p>
                {user && !showQuestionForm && !isAdmin && (
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="mt-4 flex items-center space-x-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Ask First Question</span>
                  </button>
                )}
              </div>
            )}

          {getFaqByLessonIdQuery.data?.data?.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              isAdmin={isAdmin}
              onBlockUser={(userId, userName) =>
                setBlockModal({ userId, userName })
              }
              onDeleteQuestion={(id) => deleteQuestionMutation.mutate(id)}
              onDeleteReply={(id) => deleteReplyMutation.mutate(id)}
              onCreateAdminReply={(data, options) =>
                createAdminReplyMutation.mutate(data, options)
              }
              isReplyPending={createAdminReplyMutation.isPending}
            />
          ))}
        </div>

        {/* Stats Footer */}
        {getFaqByLessonIdQuery.data?.data &&
          getFaqByLessonIdQuery.data.data.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                {getFaqByLessonIdQuery.data.data.length}
                {getFaqByLessonIdQuery.data.data.length === 1
                  ? " question"
                  : " questions"}{" "}
                about this lesson
              </p>
            </div>
          )}
      </div>

      {/* Block User Modal */}
      {isAdmin && blockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Block User</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Block <span className="font-medium text-foreground">{blockModal.userName}</span> from commenting
            </p>

            <div className="space-y-3 mb-4">
              <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="radio"
                  name="blockScope"
                  checked={blockScope === "lesson"}
                  onChange={() => setBlockScope("lesson")}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-foreground">This Lesson Only</p>
                  <p className="text-xs text-muted-foreground">User can still comment on other lessons</p>
                </div>
              </label>
              {courseId && (
                <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="radio"
                    name="blockScope"
                    checked={blockScope === "course"}
                    onChange={() => setBlockScope("course")}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-foreground">Entire Course</p>
                    <p className="text-xs text-muted-foreground">User cannot comment on any lesson</p>
                  </div>
                </label>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  blockUserMutation.mutate({
                    userId: blockModal.userId,
                    ...(blockScope === "lesson" ? { lessonId: currentLesson.id } : { courseId: courseId }),
                    reason: blockReason || undefined,
                  });
                }}
                disabled={blockUserMutation.isPending}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {blockUserMutation.isPending ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiSlash className="w-4 h-4" />
                )}
                <span>Block User</span>
              </button>
              <button
                onClick={() => {
                  setBlockModal(null);
                  setBlockReason("");
                }}
                className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
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
