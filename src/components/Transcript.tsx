import { useEffect, useRef, useState, RefObject } from 'react';

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
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


const Transcript = ({ segments, currentTime, onClaimClick, scrollContainerRef }: TranscriptProps) => {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrolledIndexRef = useRef<number>(-1);
  const isUserScrollingRef = useRef(false);

  // Find current segment based on video time
  const getCurrentSegmentIndex = () => {
    return segments.findIndex(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    );
  };

  const currentSegmentIndex = getCurrentSegmentIndex();

  // Scroll to segment function
  const scrollToSegment = (index: number) => {
    if (!scrollContainerRef?.current || index < 0) return;

    const currentElement = document.querySelector(
      `[data-segment-id="${segments[index].id}"]`
    );

    if (currentElement) {
      const container = scrollContainerRef.current;
      const elementTop = (currentElement as HTMLElement).offsetTop - container.offsetTop;

      container.scrollTo({
        top: elementTop,
        behavior: 'smooth',
      });
      lastScrolledIndexRef.current = index;
    }
  };

  // Auto-scroll to current segment when it changes
  useEffect(() => {
    if (!autoScroll || isUserScrollingRef.current) return;

    // Only scroll if segment changed or we haven't scrolled to this segment yet
    if (currentSegmentIndex >= 0 && currentSegmentIndex !== lastScrolledIndexRef.current) {
      requestAnimationFrame(() => {
        scrollToSegment(currentSegmentIndex);
      });
    }
  }, [currentSegmentIndex, autoScroll, segments]);

  // Initial scroll on mount
  useEffect(() => {
    if (currentSegmentIndex >= 0 && autoScroll) {
      const timer = setTimeout(() => {
        scrollToSegment(currentSegmentIndex);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle scroll events on the container to detect manual scrolling
  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScrollStart = () => {
      isUserScrollingRef.current = true;
      setAutoScroll(false);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };

    const handleScrollEnd = () => {
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
        setAutoScroll(true);
        lastScrolledIndexRef.current = -1;
      }, 3000);
    };

    const handleWheel = () => {
      handleScrollStart();
      handleScrollEnd();
    };

    const handleTouchMove = () => {
      handleScrollStart();
      handleScrollEnd();
    };

    container.addEventListener('wheel', handleWheel);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchmove', handleTouchMove);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollContainerRef]);

  return (
    <div
      ref={internalContainerRef}
      className="flex flex-col gap-3 py-4 rounded-lg w-full bg-white"
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
            <p className="text-sm font-mono text-gray-600 whitespace-nowrap flex-shrink-0 pt-0.5">
              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
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