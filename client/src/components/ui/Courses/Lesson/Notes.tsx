import { useEffect, useState, useRef, useCallback } from "react";
import type {
  Lessons,
  Response,
  UserLessonNotes,
  Video,
} from "../../../../types";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreateUserLessonNotesRequestParams } from "../../../../types/zod";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import {
  FiSave,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiBarChart2,
  FiTrash2,
} from "react-icons/fi";

interface LessonNotesQueryResponse extends Response {
  data: UserLessonNotes[];
}

export default function Notes({
  currentLesson,
}: {
  currentLesson: Lessons & { Video: Video[] };
}) {
  const [notes, setNotes] = useState("");
  const [originalNotes, setOriginalNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>(null);

  const createUserLessonNotesMutation = useMutation({
    mutationFn: async (data: CreateUserLessonNotesRequestParams) => {
      const res = await api.post(
        API_ROUTES.USER_LESSON_NOTES.CREATE_NOTES,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      lessonNotesQuery.refetch();
    },
    onError: (error) => {
      console.error("Error saving notes:", error);
    },
  });

  const lessonNotesQuery = useQuery({
    queryKey: ["lesson-notes", currentLesson.id],
    queryFn: async () => {
      const res = await api.get<LessonNotesQueryResponse>(
        API_ROUTES.USER_LESSON_NOTES.GET_NOTES_BY_LESSON_ID(currentLesson.id)
      );
      return res.data;
    },
  });

  useEffect(() => {
    if (lessonNotesQuery.data && lessonNotesQuery.data.data.length > 0) {
      const noteData = lessonNotesQuery.data.data[0];
      const originalContent = noteData.content;
      setNotes(originalContent);
      setOriginalNotes(originalContent);
      setLastSaved(new Date(noteData.updatedAt));
      setHasUnsavedChanges(false);
    } else {
      setNotes("");
      setOriginalNotes("");
      setLastSaved(null);
      setHasUnsavedChanges(false);
    }
  }, [lessonNotesQuery.data]);

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNotes = e.target.value;
      setNotes(newNotes);
      setHasUnsavedChanges(newNotes !== originalNotes);

      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save after 2 seconds of inactivity
      if (newNotes !== originalNotes) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          if (newNotes.trim() !== originalNotes.trim()) {
            handleSaveNotes(newNotes);
          }
        }, 2000);
      }
    },
    [originalNotes]
  );

  const handleSaveNotes = useCallback(
    (contentToSave?: string) => {
      const content = contentToSave || notes;
      if (content.trim() === originalNotes.trim()) return;

      createUserLessonNotesMutation.mutate({
        content: content,
        lessonId: currentLesson.id,
      });
    },
    [notes, originalNotes, currentLesson.id, createUserLessonNotesMutation]
  );

  const handleClearNotes = () => {
    setNotes("");
    setHasUnsavedChanges(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getWordCount = () => {
    return notes.trim() ? notes.trim().split(/\s+/).length : 0;
  };

  const getCharacterCount = () => {
    return notes.length;
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - lastSaved.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return lastSaved.toLocaleDateString();
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Lesson Notes
            </h3>
          </div>

          {/* Save Status Indicator */}
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 px-1 py-1 bg-destructive/10 rounded-full">
                <FiAlertCircle className="w-4 h-4 text-destructive" />
              </div>
            )}

            {lastSaved && !hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FiCheckCircle className="w-4 h-4 text-green-500" />
                <span>Saved {formatLastSaved()}</span>
              </div>
            )}

            {hasUnsavedChanges && (
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => handleSaveNotes()}
                hidden={
                  createUserLessonNotesMutation.isPending || !notes.trim()
                }
              >
                {createUserLessonNotesMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                <span>
                  {createUserLessonNotesMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full h-64 p-6 outline-none focus:outline-none resize-none text-foreground leading-relaxed placeholder-muted-foreground bg-card border-b border-border"
          placeholder="Start typing your notes here... 
• Key concepts from this lesson
• Questions you have
• Ideas to explore further
• Personal insights and reflections"
          value={notes}
          onChange={handleNotesChange}
          disabled={lessonNotesQuery.isLoading}
        />

        {/* Loading State */}
        {lessonNotesQuery.isLoading && (
          <div className="absolute inset-0 bg-card bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">
                Loading your notes...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats and Actions */}
      <div className="px-6 py-4 bg-muted border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <FiFileText className="w-4 h-4 text-muted-foreground" />
              <span>{getWordCount()} words</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiBarChart2 className="w-4 h-4 text-muted-foreground" />
              <span>{getCharacterCount()} characters</span>
            </div>
            {notes.length > 0 && (
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-muted-foreground" />
                <span>~{Math.ceil(getWordCount() / 200)} min read</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {notes.length > 0 && (
              <button
                onClick={handleClearNotes}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
