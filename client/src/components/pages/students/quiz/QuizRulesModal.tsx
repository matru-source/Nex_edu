import { useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

interface QuizRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  quizTitle: string;
  duration: number | null;
  maxAttempts: number;
  totalQuestions: number;
}

export default function QuizRulesModal({
  isOpen,
  onClose,
  onAccept,
  quizTitle,
  duration,
  maxAttempts,
  totalQuestions,
}: QuizRulesModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const rules = [
    {
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      text: `You have a maximum of ${maxAttempts} attempts for this quiz.`,
    },
    {
      icon: <AlertTriangle className="text-red-500" size={20} />,
      text: "Switching tabs, opening other apps, or leaving this page will end your quiz immediately.",
    },
    {
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      text: duration
        ? `You have ${duration} minutes to complete the quiz.`
        : "There is no time limit for this quiz.",
    },
    {
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      text: "Once you start, you must complete the quiz in one session.",
    },
    {
      icon: <CheckCircle2 className="text-green-500" size={20} />,
      text: `There are ${totalQuestions} questions in this quiz.`,
    },
    {
      icon: <CheckCircle2 className="text-green-500" size={20} />,
      text: "Your results will be shown immediately after submission.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-[var(--border)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Quiz Rules</h2>
              <p className="text-white/80 text-sm mt-1">{quizTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Rules List */}
        <div className="px-6 py-5 space-y-4 max-h-[50vh] overflow-y-auto">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Please read the following rules carefully before starting the quiz:
          </p>

          {rules.map((rule, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]/30 border border-[var(--border)]"
            >
              <div className="flex-shrink-0 mt-0.5">{rule.icon}</div>
              <p className="text-[var(--foreground)] text-sm">{rule.text}</p>
            </div>
          ))}
        </div>

        {/* Acknowledgment */}
        <div className="px-6 py-4 bg-[var(--muted)]/20 border-t border-[var(--border)]">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-2 border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
            />
            <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              I have read and understand the rules. I agree to follow them during the quiz.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={!accepted}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
