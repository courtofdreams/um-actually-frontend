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

export const LoadingPage = ({ preview }: LoadingPageProps) => {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Processing your analysis</EmptyTitle>
        <EmptyDescription>
          Please wait while we process your request. Do not refresh the page.
        </EmptyDescription>
      </EmptyHeader>
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