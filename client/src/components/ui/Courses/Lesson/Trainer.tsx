import type { Lessons, Video } from "../../../../types";

export default function Trainer({
  currentLesson,
}: {
  currentLesson: Lessons & { Video: Video[] };
}) {
  return (
    <div className="bg-card rounded-xl border border-border mt-6 p-6">
      <div className="text-center">
        <div className="text-foreground font-medium mb-2">Request Training</div>
        <p className="text-muted-foreground text-sm">
          Request personalized training for {currentLesson.title}
        </p>
      </div>
    </div>
  );
}
