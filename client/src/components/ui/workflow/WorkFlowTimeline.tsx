import {
  CheckCircle,
  XCircle,
  Send,
  Edit,
  Clock,
  Tag,
  User,
} from "lucide-react";

interface WorkflowEvent {
  id: string;
  action: string;
  statusFrom?: string;
  statusTo?: string;
  performedBy?: string;
  performedByName?: string;
  createdAt: string;
  metadata?: any;
}

interface WorkflowTimelineProps {
  events: WorkflowEvent[];
  className?: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATED":
      return Edit;
    case "SUBMITTED":
      return Send;
    case "APPROVED":
    case "PUBLISHED":
      return CheckCircle;
    case "REJECTED":
      return XCircle;
    case "FLAG_CHANGED":
      return Tag;
    default:
      return Clock;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "CREATED":
      return "bg-gray-500";
    case "SUBMITTED":
      return "bg-blue-500";
    case "APPROVED":
      return "bg-green-500";
    case "REJECTED":
      return "bg-red-500";
    case "PUBLISHED":
      return "bg-purple-500";
    case "FLAG_CHANGED":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
};

export default function WorkflowTimeline({
  events,
  className = "",
}: WorkflowTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Clock className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
        <p className="text-[var(--muted-foreground)]">
          No workflow history available
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {events.map((event, index) => {
        const ActionIcon = getActionIcon(event.action);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4 relative">
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${getActionColor(
                  event.action
                )} flex items-center justify-center z-10`}
              >
                <ActionIcon className="h-2.5 w-2.5 text-white" />
              </div>
              {!isLast && (
                <div className="w-0.5 h-full bg-[var(--border)] mt-2 min-h-[60px]" />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-[var(--foreground)]">
                  {event.action.replace(/_/g, " ")}
                </span>
                {event.statusFrom && event.statusTo && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    ({event.statusFrom} → {event.statusTo})
                  </span>
                )}
                <span className="text-xs text-[var(--muted-foreground)] ml-auto">
                  {new Date(event.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {event.performedByName && (
                <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mb-2">
                  <User className="h-3 w-3" />
                  By: {event.performedByName}
                </p>
              )}

              {event.metadata && (
                <div className="mt-2 space-y-2">
                  {event.metadata.rejectionReason && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {event.metadata.rejectionReason}
                      </p>
                    </div>
                  )}

                  {event.metadata.flags && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">
                        Flags:
                      </span>
                      {event.metadata.flags.map((flag: string) => (
                        <span
                          key={flag}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
                          {flag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
