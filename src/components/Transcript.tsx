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
  isPlaying?: boolean;
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

// Fuzzy match to find the best substring in text that matches the claim
// Extends match to the end of the sentence
const findClaimInText = (text: string, claim: string): { start: number; end: number } | null => {
  // First, try exact match
  const exactIndex = text.indexOf(claim);
  if (exactIndex !== -1) {
    // Extend to end of sentence
    const endOfSentence = findEndOfSentence(text, exactIndex + claim.length);
    return { start: exactIndex, end: endOfSentence };
  }

  // If no exact match, try case-insensitive
  const lowerText = text.toLowerCase();
  const lowerClaim = claim.toLowerCase();
  const caseInsensitiveIndex = lowerText.indexOf(lowerClaim);
  if (caseInsensitiveIndex !== -1) {
    // Extend to end of sentence
    const endOfSentence = findEndOfSentence(text, caseInsensitiveIndex + claim.length);
    return { start: caseInsensitiveIndex, end: endOfSentence };
  }

  // Try to find longest common word sequence
  const claimWords = claim.toLowerCase().split(/\s+/);
  const textWords = text.toLowerCase().split(/\s+/);

  let bestMatch = { start: -1, end: -1, length: 0 };

  // Look for sequences of matching words
  for (let i = 0; i < textWords.length; i++) {
    for (let j = 0; j < claimWords.length; j++) {
      let matchLength = 0;
      let k = 0;

      while (i + k < textWords.length && j + k < claimWords.length &&
             textWords[i + k] === claimWords[j + k]) {
        matchLength++;
        k++;
      }

      if (matchLength > bestMatch.length) {
        // Calculate character positions
        const wordsBeforeMatch = textWords.slice(0, i);
        const matchWords = textWords.slice(i, i + matchLength);
        const charStart = wordsBeforeMatch.join(' ').length + (wordsBeforeMatch.length > 0 ? 1 : 0);
        const charEnd = charStart + matchWords.join(' ').length;

        bestMatch = { start: charStart, end: charEnd, length: matchLength };
      }
    }
  }

  // If we found a match with at least 2 words, extend to end of sentence
  if (bestMatch.length >= 2) {
    const endOfSentence = findEndOfSentence(text, bestMatch.end);
    return { start: bestMatch.start, end: endOfSentence };
  }

  // Otherwise, return null (no good match found)
  return null;
};

// Helper function to find the end of a sentence starting from a position
const findEndOfSentence = (text: string, startPos: number): number => {
  // Look for sentence-ending punctuation: . ! ? or end of text
  const sentenceEnd = /[.!?]/;

  for (let i = startPos; i < text.length; i++) {
    if (sentenceEnd.test(text[i])) {
      return i + 1; // Include the punctuation
    }
  }

  // If no punctuation found, return end of text
  return text.length;
};


const Transcript = ({ segments, currentTime, onClaimClick, scrollContainerRef, isPlaying = false }: TranscriptProps) => {
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
      const containerRect = container.getBoundingClientRect();
      const elementRect = (currentElement as HTMLElement).getBoundingClientRect();

      // Calculate the offset relative to the container's current scroll position
      const relativeTop = elementRect.top - containerRect.top + container.scrollTop;

      // Center the element in the container (optional, but makes it look better)
      const offset = relativeTop - (containerRect.height / 4);

      container.scrollTo({
        top: Math.max(0, offset),
        behavior: 'smooth',
      });
      lastScrolledIndexRef.current = index;
    }
  };

  // Auto-scroll to current segment when it changes
  useEffect(() => {
    // Only auto-scroll if video is playing
    if (!autoScroll || isUserScrollingRef.current || !isPlaying) {
      return;
    }

    // Only scroll if segment changed or we haven't scrolled to this segment yet
    if (currentSegmentIndex >= 0 && currentSegmentIndex !== lastScrolledIndexRef.current) {
      requestAnimationFrame(() => {
        scrollToSegment(currentSegmentIndex);
      });
    }
  }, [currentSegmentIndex, autoScroll, segments, isPlaying]);

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
        if (isPlaying) {
          setAutoScroll(true);
          lastScrolledIndexRef.current = -1;
        }
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
  }, [scrollContainerRef, isPlaying]);

  useEffect(() => {
    if (isPlaying && !isUserScrollingRef.current) {
      setAutoScroll(true);
      lastScrolledIndexRef.current = -1;
    }
  }, [isPlaying]);

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
              {segment.claim ? (
                <>
                  {(() => {
                    // Use fuzzy matching to find claim in text
                    const match = findClaimInText(segment.text, segment.claim);

                    if (match) {
                      const beforeClaim = segment.text.substring(0, match.start);
                      const claimText = segment.text.substring(match.start, match.end);
                      const afterClaim = segment.text.substring(match.end);

                      return (
                        <>
                          {beforeClaim && <span>{beforeClaim}</span>}
                          <span
                            onClick={() => {
                              console.log(">>> Claim span clicked! Segment:", segment.id);
                              console.log(">>> Claim text:", segment.claim);
                              console.log(">>> Matched text:", claimText);
                              console.log(">>> Claim index:", segment.claimIndex);
                              if (segment.claimIndex !== undefined) {
                                console.log(">>> Calling onClaimClick with index:", segment.claimIndex);
                                onClaimClick(segment.claimIndex);
                              } else {
                                console.log(">>> ERROR: claimIndex is undefined, not calling onClaimClick");
                              }
                            }}
                            className="bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors px-1 rounded font-semibold"
                          >
                            {claimText}
                          </span>
                          {afterClaim && <span>{afterClaim}</span>}
                        </>
                      );
                    } else {
                      // If no good match found, highlight the entire segment
                      console.log(">>> No fuzzy match found. Highlighting entire segment.");
                      console.log(">>> Segment text:", segment.text);
                      console.log(">>> Claim:", segment.claim);
                      return (
                        <span
                          onClick={() => {
                            if (segment.claimIndex !== undefined) {
                              onClaimClick(segment.claimIndex);
                            }
                          }}
                          className="bg-yellow-200 cursor-pointer hover:bg-yellow-300 transition-colors px-1 rounded font-semibold"
                        >
                          {segment.text}
                        </span>
                      );
                    }
                  })()}
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