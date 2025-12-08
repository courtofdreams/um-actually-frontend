import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type LoadingPageProps = {
  preview?: string;
};

const LOADING_STAGES = [
  { message: "Analyzing your text...", detail: "Identifying factual claims" },
  { message: "Processing claims...", detail: "Extracting key statements to verify" },
  { message: "Searching for sources...", detail: "Finding reliable references" },
  { message: "Verifying articles...", detail: "Checking source credibility" },
  { message: "Cross-referencing data...", detail: "Comparing multiple sources" },
  { message: "Building your report...", detail: "Compiling analysis results" },
];

export const LoadingPage = ({ preview }: LoadingPageProps) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through stages every 6 seconds (slowed down 2x)
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 5000);

    // Animate progress bar smoothly (slowed down 2x)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Progress moves faster at start, slows down approaching 90%
        if (prev < 30) return prev + 1;
        if (prev < 60) return prev + 0.5;
        if (prev < 85) return prev + 0.25;
        if (prev < 96) return prev + 0.1;
        return prev; // Cap at ~96% until complete
      });
    }, 100);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStage = LOADING_STAGES[stageIndex];

  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle className="transition-all duration-500">
          {currentStage.message}
        </EmptyTitle>
        <EmptyDescription className="transition-all duration-500">
          {currentStage.detail}
        </EmptyDescription>
      </EmptyHeader>

      {/* Progress bar */}
      <div className="mt-4 w-full max-w-md px-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Stage indicators */}
      <div className="mt-4 flex gap-1.5">
        {LOADING_STAGES.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === stageIndex
              ? "bg-primary scale-125"
              : idx < stageIndex
                ? "bg-primary/50"
                : "bg-muted"
              }`}
          />
        ))}
      </div>

      {preview && (
        <div className="mt-6 max-w-2xl w-full px-4">
          <p className="text-xs text-muted-foreground mb-2 text-left">Your submission:</p>
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 max-h-48 overflow-y-auto">
            <p className="text-sm text-muted-foreground text-left whitespace-pre-wrap line-clamp-6">
              {preview}
            </p>
          </div>
        </div>
      )}
    </Empty>
  );
}

export default LoadingPage;