// Service to fetch YouTube video transcripts using the youtube-transcript-api
// This service communicates with a backend endpoint that extracts transcripts

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  claim?: string;
  claimIndex?: number;
}

export interface TranscriptData {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
  error?: string;
}

/**
 * Extract video ID from YouTube URL
 */
export const extractYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Fetch transcript from backend
 * The backend should handle calling youtube-transcript-api
 */
export const fetchYoutubeTranscript = async (videoUrl: string): Promise<TranscriptData> => {
  try {
    const videoId = extractYoutubeId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const requestBody = JSON.stringify({ videoUrl, videoId });

    // Get backend URL from environment variable (set at build time)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000/api';
    
    const response = await fetch(`${backendUrl}/transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return {
      videoId: '',
      title: '',
      segments: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Convert raw transcript data to segments with proper timing
 * Raw transcript usually comes as { text, start, duration } objects
 */
export const convertTranscriptToSegments = (
  rawTranscript: Array<{ text: string; start: number; duration: number }>,
  groupByWords: number = 10
): TranscriptSegment[] => {
  const segments: TranscriptSegment[] = [];
  let words: string[] = [];
  let startTime = 0;
  let segmentId = 0;

  rawTranscript.forEach((item, idx) => {
    const itemWords = item.text.split(' ');
    words.push(...itemWords);

    // Group approximately every N words for better UX
    if (words.length >= groupByWords || idx === rawTranscript.length - 1) {
      const endTime = item.start + item.duration;
      segments.push({
        id: `seg_${segmentId}`,
        text: words.join(' '),
        startTime: startTime,
        endTime: endTime,
      });

      segmentId++;
      words = [];
      startTime = endTime;
    }
  });

  return segments;
};