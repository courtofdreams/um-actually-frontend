import {Spinner} from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const LoadingPage = () => {
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
        </Empty>
    );
}

export default LoadingPage;