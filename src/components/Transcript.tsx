import { useEffect, useRef, useState } from 'react';

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  claim?: string;
  claimIndex?: number;
}

interface TranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onClaimClick: (claimIndex: number) => void;
}

const Transcript = ({ segments, currentTime, onClaimClick }: TranscriptProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  // Find current segment based on video time
  const getCurrentSegmentIndex = () => {
    return segments.findIndex(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    );
  };

  const currentSegmentIndex = getCurrentSegmentIndex();

  // Handle manual scroll - disable auto-scroll for 5 seconds
  const handleScroll = () => {
    setAutoScroll(false);
    lastScrollTimeRef.current = Date.now();

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Re-enable auto-scroll after 5 seconds of no scroll
    scrollTimeoutRef.current = setTimeout(() => {
      setAutoScroll(true);
    }, 5000);
  };

  // Auto-scroll to current segment when autoScroll is enabled
  useEffect(() => {
    if (autoScroll && currentSegmentIndex >= 0 && containerRef.current) {
      const currentElement = containerRef.current.querySelector(
        `[data-segment-id="${segments[currentSegmentIndex].id}"]`
      );

      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentSegmentIndex, autoScroll, segments]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-col gap-3 py-4 overflow-y-auto rounded-lg bg-white"
      style={{
        flex: 1,
        width: '100%',
      }}
    >
      {segments.map((segment, index) => {
        const isCurrentSegment = index === currentSegmentIndex;

        return (
          <div
            key={segment.id}
            data-segment-id={segment.id}
            className={`p-3 rounded-lg transition-all duration-200 flex flex-row gap-4 items-start ${
              isCurrentSegment
                ? 'bg-blue-100 border-l-4 border-blue-500'
                : 'bg-gray-50 border-l-4 border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600 whitespace-nowrap flex-shrink-0 pt-0.5">
              {Math.floor(segment.startTime)}s - {Math.floor(segment.endTime)}s
            </p>

            <p className="text-gray-800 flex-grow">
              {segment.claim && segment.text.startsWith(segment.claim) ? (
                <>
                  <span
                    onClick={() => {
                      if (segment.claimIndex !== undefined) {
                        onClaimClick(segment.claimIndex);
                      }
                    }}
                    className="bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors px-1 rounded font-semibold"
                  >
                    {segment.claim}
                  </span>
                  <span>{segment.text.substring(segment.claim.length)}</span>
                </>
              ) : (
                segment.text
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Transcript;