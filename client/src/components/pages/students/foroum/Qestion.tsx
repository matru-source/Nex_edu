import { useParams } from "react-router-dom";
import TopBar from "../../../lazy/TopBar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ROUTES } from "../../../../lib/api";
import api from "../../../../lib/axios/axios";
import { userStore } from "../../../../state/global";
import { useState } from "react";
import type { CreateQuestionReplyRequestParams } from "../../../../types/zod";
import {
  FaUser,
  FaReply,
  FaComment,
  FaRegClock,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoIosSend } from "react-icons/io";

interface QuestionData {
  id: string;
  question: string;
  userId: string;
  lessonId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ReplyData {
  id: string;
  reply: string;
  questionId: string;
  parentId: string | null;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
  };
  children: ReplyData[];
}

interface QuestionTreeResponse {
  question: QuestionData;
  replies: ReplyData[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

function ReplyComponent({
  reply,
  currentUserId,
  questionId,
  onReplySuccess,
  depth = 0,
}: {
  reply: ReplyData;
  currentUserId: string;
  questionId: string;
  onReplySuccess: () => void;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const isCurrentUser = reply.userId === currentUserId;
  const maxDepth = 3;
  const shouldIndent = depth > 0 && depth < maxDepth;

  const createReplyMutation = useMutation({
    mutationFn: async (data: CreateQuestionReplyRequestParams) => {
      const res = await api.post(API_ROUTES.FORUM.CREATE_QUESTION_REPLY, data);
      return res.data;
    },
    onSuccess: () => {
      setReplyText("");
      setShowReplyForm(false);
      onReplySuccess();
    },
    onError: (error) => {
      console.error("Error creating reply:", error);
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    createReplyMutation.mutate({
      questionId,
      userId: currentUserId,
      reply: replyText,
      parentId: reply.id,
    });
  };

  const hasChildren = reply.children && reply.children.length > 0;

  return (
    <div
      className={`${
        shouldIndent ? "ml-6 pl-4 border-l-2 border-border" : ""
      } transition-all duration-200`}
    >
      <div
        className={`p-4 rounded-xl transition-all duration-200 ${
          isCurrentUser
            ? "bg-primary/10 border border-primary/20"
            : "bg-card border border-border hover:border-border/80"
        } shadow-sm hover:shadow-md`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                isCurrentUser
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <FaUser size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${
                    isCurrentUser ? "text-primary" : "text-foreground"
                  }`}
                >
                  {reply.user.name}
                </span>
                {isCurrentUser && (
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <FaRegClock size={10} />
                <span>{formatDate(reply.createdAt)}</span>
              </div>
            </div>
          </div>

          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </button>
          )}
        </div>

        {/* Reply Content */}
        <p className="text-foreground mb-4 leading-relaxed">{reply.reply}</p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              showReplyForm
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            }`}
          >
            <FaReply size={12} />
            Reply
          </button>

          {hasChildren && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FaComment size={10} />
              <span>
                {reply.children.length}{" "}
                {reply.children.length === 1 ? "reply" : "replies"}
              </span>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form
            onSubmit={handleReplySubmit}
            className="mt-4 animate-in fade-in duration-200"
          >
            <div className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="w-full p-3 border border-border rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary pr-12 transition-all duration-200 bg-background"
                rows={3}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="submit"
                disabled={createReplyMutation.isPending || !replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <IoIosSend size={14} />
                {createReplyMutation.isPending ? "Sending..." : "Send Reply"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText("");
                }}
                className="px-4 py-2 border border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {hasChildren && isExpanded && (
        <div className="mt-4 space-y-4 animate-in fade-in duration-200">
          {reply.children.map((childReply) => (
            <ReplyComponent
              key={childReply.id}
              reply={childReply}
              currentUserId={currentUserId}
              questionId={questionId}
              onReplySuccess={onReplySuccess}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Question() {
  const { questionId } = useParams();
  const user = userStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showMainReplyForm, setShowMainReplyForm] = useState(false);
  const [mainReplyText, setMainReplyText] = useState("");

  if (!questionId) return <div>Invalid Question ID</div>;
  if (!user) return <div>Please login to view questions</div>;

  const getQuestionReplyQuery = useQuery({
    queryKey: ["get-question-reply", questionId],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.FORUM.GET_QUESTION_TREE(questionId));
      return res.data;
    },
  });

  const createMainReplyMutation = useMutation({
    mutationFn: async (data: CreateQuestionReplyRequestParams) => {
      const res = await api.post(API_ROUTES.FORUM.CREATE_QUESTION_REPLY, data);
      return res.data;
    },
    onSuccess: () => {
      setMainReplyText("");
      setShowMainReplyForm(false);
      queryClient.invalidateQueries({
        queryKey: ["get-question-reply", questionId],
      });
    },
    onError: (error) => {
      console.error("Error creating reply:", error);
    },
  });

  const handleMainReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainReplyText.trim()) return;

    createMainReplyMutation.mutate({
      questionId,
      userId: user.id,
      reply: mainReplyText,
    });
  };

  const handleReplySuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["get-question-reply", questionId],
    });
  };

  if (getQuestionReplyQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full"></div>
            <div className="text-muted-foreground font-medium">
              Loading question...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (getQuestionReplyQuery.isError) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaComment className="text-destructive" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error loading question
            </h3>
            <p className="text-muted-foreground">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  const data: { data: QuestionTreeResponse } = getQuestionReplyQuery.data;
  const { question, replies } = data.data;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <div className="p-8">
        {/* Original Question Card */}
        <div>
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-8 transition-all duration-200 hover:shadow-md h-fit">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <FaUser className="text-muted-foreground" size={16} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-foreground text-lg">
                    {question.user.name}
                  </span>
                  {question.userId === user.id && (
                    <span className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      You
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FaRegClock size={12} />
                    {formatDate(question.createdAt)}
                  </span>
                </div>
                <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {question.question}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={() => setShowMainReplyForm(!showMainReplyForm)}
                className="flex items-center gap-3 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                <FaReply size={14} />
                Reply to Question
              </button>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FaComment size={14} />
                <span>
                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </span>
              </div>
            </div>

            {/* Main Reply Form */}
            {showMainReplyForm && (
              <form
                onSubmit={handleMainReplySubmit}
                className="mt-6 animate-in fade-in duration-200"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={mainReplyText}
                    onChange={(e) => setMainReplyText(e.target.value)}
                    placeholder="Write your reply to this question..."
                    className="w-full p-4 border border-border rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background"
                    rows={4}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      createMainReplyMutation.isPending || !mainReplyText.trim()
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                  >
                    <IoIosSend size={16} />
                    {createMainReplyMutation.isPending
                      ? "Sending..."
                      : "Post Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMainReplyForm(false);
                      setMainReplyText("");
                    }}
                    className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-xl">
              <FaComment className="text-muted-foreground" size={18} />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Replies ({replies.length})
            </h2>
          </div>

          {replies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComment className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No replies yet
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Be the first to share your thoughts and help answer this
                question.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {replies.map((reply) => (
                <ReplyComponent
                  key={reply.id}
                  reply={reply}
                  currentUserId={user.id}
                  questionId={questionId}
                  onReplySuccess={handleReplySuccess}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
