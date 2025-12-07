// Service to analyze video transcripts using OpenAI
// Similar to text analysis but for video transcript segments

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  claim?: string;
  claimIndex?: number;
}

export interface Source {
  title: string;
  claimReference?: string;
  url: string;
  ratingStance: "Mostly Support" | "Partially Support" | "Opposite";
  snippet: string;
  datePosted: string;
}

export interface SourceGroup {
  claim: string;
  confidenceReason: string;
  ratingPercent: number;
  sources: Source[];
}

export interface VideoAnalysisResponse {
  videoId: string;
  confidenceScores: number;
  reasoning: string;
  segments: TranscriptSegment[];
  sourcesList: SourceGroup[];
}

/**
 * Analyze video transcript segments with OpenAI to identify claims and sources
 */
export const analyzeVideoTranscript = async (
  videoId: string,
  segments: TranscriptSegment[]
): Promise<VideoAnalysisResponse> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000/api';

    const response = await fetch(`${backendUrl}/video-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId,
        segments: segments.map(seg => ({
          id: seg.id,
          text: seg.text,
          startTime: seg.startTime,
          endTime: seg.endTime
        }))
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze video transcript: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing video transcript:', error);
    throw error;
  }
};
