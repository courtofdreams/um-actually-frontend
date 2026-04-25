import VideoPlayer from "./VideoPlayer";
import Transcript from "./Transcript";
import SourceCard from "./SourceCard";
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "@/contexts/AppContext";
import { fetchYoutubeTranscript } from "@/services/youtubeTranscript";
import { analyzeVideoTranscript } from "@/services/videoAnalysis";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ProgressiveBar } from "@/components/ui/progressive-bar";
import { AlertCircleIcon } from "lucide-react";
import { saveToHistory } from "./HistorySidebar";
import { useRouter } from "next/navigation";
import { TextAnalysisResponse, SourceGroup } from "@/hooks/anaysis";
import LoadingPage from "./ui/loading-page";
import { InfoIcon, SparklesIcon } from "lucide-react";

type ConfidenceInfo = {
  level: string;
  tone: "positive" | "warning" | "danger" | "neutral";
  title: string;
  description: string;
  action: string;
};

const toneStyles: Record<ConfidenceInfo["tone"], string> = {
  positive: "bg-green-50/80 border-green-200 text-green-700",
  warning: "bg-yellow-50/80 border-yellow-200 text-yellow-700",
  danger: "bg-red-50/80 border-red-200 text-red-700",
  neutral: "bg-pink-50/80 border-pink-200 text-pink-700",
};

const getConfidenceInfo = (score: number): ConfidenceInfo => {
  const value = Math.max(0, Math.min(100, Number(score) || 0));

  if (value >= 90) {
    return {
      level: "Very High Confidence",
      tone: "positive",
      title: "What this score means:",
      description:
        "Multiple reliable sources strongly support this claim, with high agreement across evidence. Low uncertainty detected.",
      action: "Reasonably safe to rely on, though you can still inspect sources for context.",
    };
  }

  if (value >= 75) {
    return {
      level: "High Confidence",
      tone: "positive",
      title: "What this score means:",
      description:
        "The claim is well supported by credible evidence, though minor ambiguity or missing context may remain.",
      action: "Generally trustworthy, with optional source review for added context.",
    };
  }

  if (value >= 60) {
    return {
      level: "Moderate Confidence",
      tone: "warning",
      title: "What this score means:",
      description:
        "Evidence mostly supports this claim, but there may be gaps, limited corroboration, or some disagreement across sources.",
      action: "Use with caution and verify if the claim is important or high stakes.",
    };
  }

  if (value >= 40) {
    return {
      level: "Low Confidence",
      tone: "warning",
      title: "What this score means:",
      description:
        "Evidence is limited, conflicting, or difficult to verify. Low confidence does not necessarily mean the claim is false — it may indicate insufficient public evidence or contested information.",
      action: "Verify before relying on or sharing this claim.",
    };
  }

  if (value >= 20) {
    return {
      level: "Very Low Confidence",
      tone: "danger",
      title: "What this score means:",
      description:
        "Little reliable support was found, or sources significantly disagree. The claim may be misleading, incomplete, or hard to validate.",
      action: "Independent verification strongly recommended before acting on this.",
    };
  }

  return {
    level: "Minimal Confidence",
    tone: "danger",
    title: "What this score means:",
    description:
      "There is very weak or no trustworthy evidence supporting this claim. High uncertainty or potential misinformation risk detected.",
    action: "Do not rely on this claim without strong external verification.",
  };
};

const mapClaimType = (claimType?: string): "verifiable" | "anonymous_source" | "subjective_inference" => {
  if (claimType === "anonymous_source") return "anonymous_source";
  if (claimType === "inference" || claimType === "subjective_inference") return "subjective_inference";
  return "verifiable";
};

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  claim?: string;
  claimIndex?: number;
}

// Mock data for video analysis
const mockVideoData = {
  confidenceScores: -1,  // -1 indicates loading state
  reasoning: "Loading...",
  transcript: [
    { id: "seg1", text: "The Earth's average temperature has increased", startTime: 0, endTime: 5, claim: "true", claimIndex: 0 },
    { id: "seg2", text: "by approximately 1.1 degrees Celsius since pre-industrial times.", startTime: 5, endTime: 10 },
    { id: "seg3", text: "This warming is primarily caused by human activities", startTime: 10, endTime: 15, claim: "true", claimIndex: 1 },
    { id: "seg4", text: "including the burning of fossil fuels and deforestation.", startTime: 15, endTime: 20 },
    { id: "seg5", text: "The arctic ice is melting at an unprecedented rate,", startTime: 20, endTime: 25, claim: "true", claimIndex: 2 },
    { id: "seg6", text: "losing about 13% of its mass per decade.", startTime: 25, endTime: 30 },
    { id: "seg7", text: "Sea levels have risen by about 8-9 inches since 1880.", startTime: 30, endTime: 35, claim: "true", claimIndex: 3 },
    { id: "seg8", text: "This is mainly due to thermal expansion and melting ice sheets.", startTime: 35, endTime: 40 },
  ] as TranscriptSegment[],
  sourcesList: [
    {
      claim: "[1] The Earth's average temperature has increased by approximately 1.1°C",
      confidenceReason: "Backed by NASA, NOAA, and IPCC data. Multiple independent measurements confirm this trend.",
      ratingPercent: 95,
      sources: [
        { title: "NASA", claimReference: "[1] Earth Temperature Rise", url: "https://climate.nasa.gov", ratingStance: "Mostly Support" as const, snippet: "NASA satellite data shows Earth's average temperature has risen about 1.1°C since pre-industrial times, with most warming occurring in the past 50 years.", datePosted: "October 2024" },
        { title: "NOAA", url: "https://www.noaa.gov", ratingStance: "Mostly Support" as const, snippet: "NOAA's Global Monitoring Laboratory confirms consistent warming trends across multiple temperature datasets.", datePosted: "September 2024" }
      ]
    },
    {
      claim: "[2] Human activities are the primary cause of global warming",
      confidenceReason: "Overwhelming scientific consensus (97%+) supports anthropogenic climate change. Detailed in IPCC reports.",
      ratingPercent: 97,
      sources: [
        { title: "IPCC", url: "https://www.ipcc.ch", ratingStance: "Mostly Support" as const, snippet: "The IPCC Sixth Assessment Report confirms that human influence on the climate system is unequivocal.", datePosted: "August 2023" },
        { title: "Scientific American", url: "https://scientificamerican.com", ratingStance: "Mostly Support" as const, snippet: "97% of climate scientists agree that climate change is real and caused primarily by human activities.", datePosted: "March 2024" }
      ]
    },
    {
      claim: "[3] Arctic ice is melting at unprecedented rates",
      confidenceReason: "Satellite data shows 13% per decade loss. This is the highest rate in recorded history.",
      ratingPercent: 92,
      sources: [
        { title: "National Snow and Ice Data Center", url: "https://nsidc.org", ratingStance: "Mostly Support" as const, snippet: "Arctic sea ice extent has declined at a rate of about 13% per decade over the satellite record.", datePosted: "July 2024" },
        { title: "Nature Climate Change", url: "https://nature.com", ratingStance: "Mostly Support" as const, snippet: "Recent studies confirm accelerating Arctic ice loss with significant implications for global weather patterns.", datePosted: "May 2024" }
      ]
    },
    {
      claim: "[4] Sea levels have risen by 8-9 inches since 1880",
      confidenceReason: "Tide gauge and satellite data consistently show this rise. Rate of rise is accelerating.",
      ratingPercent: 94,
      sources: [
        { title: "USGS", url: "https://usgs.gov", ratingStance: "Mostly Support" as const, snippet: "Global mean sea level has risen about 8-9 inches since 1880, with the rate of rise increasing in recent decades.", datePosted: "June 2024" },
        { title: "Scripps Institution", url: "https://scripps.ucsd.edu", ratingStance: "Mostly Support" as const, snippet: "Combined satellite and tide gauge data confirm sea level rise of approximately 3.4mm per year.", datePosted: "April 2024" }
      ]
    }
  ]
};

// Helper function to generate dummy source cards from claims
const generateSourcesForClaim = (claim: string, claimIndex: number) => {
  const sourceNames = ["BBC News", "Reuters", "Associated Press", "NPR", "The Guardian", "CNN", "TechCrunch", "Wired"];
  const stances: Array<"Mostly Support" | "Partially Support" | "Opposite"> = ["Mostly Support", "Partially Support", "Opposite"];

  // Use deterministic values based on claimIndex to avoid hydration mismatch
  const sourceIndex1 = claimIndex % sourceNames.length;
  const sourceIndex2 = (claimIndex + 3) % sourceNames.length;
  const stanceIndex1 = claimIndex % stances.length;
  const stanceIndex2 = (claimIndex + 1) % stances.length;
  const ratingPercent = 75 + (claimIndex * 5) % 20; // 75-95% deterministic

  return {
    claim: `[${claimIndex + 1}] ${claim}`,
    confidenceReason: `This claim was analyzed and cross-referenced with multiple sources. The confidence level reflects the consistency across fact-checking sources.`,
    ratingPercent,
    sources: [
      {
        title: sourceNames[sourceIndex1],
        claimReference: `[${claimIndex + 1}] ${claim.substring(0, 30)}...`,
        url: `https://example.com/source-${claimIndex}-1`,
        ratingStance: stances[stanceIndex1],
        snippet: `This source provides information related to: "${claim.substring(0, 50)}...". The article discusses relevant details and context.`,
        datePosted: `${(claimIndex % 12) + 1} month${claimIndex % 2 === 0 ? 's' : ''} ago`
      },
      {
        title: sourceNames[sourceIndex2],
        url: `https://example.com/source-${claimIndex}-2`,
        ratingStance: stances[stanceIndex2],
        snippet: `According to this source, ${claim.substring(0, 40).toLowerCase()}... is an important topic that has been discussed extensively.`,
        datePosted: `${((claimIndex + 2) % 12) + 1} month${claimIndex % 2 === 1 ? 's' : ''} ago`
      }
    ]
  };
};

type VideoAnalysisProps = {
  loadedVideoUrl?: string | null;
  loadedTranscript?: TranscriptSegment[] | null;
  loadedSources?: SourceGroup[] | null;
  loadedConfidenceScore?: number | null;
  loadedReasoning?: string | null;
};

const VideoAnalysis = ({ loadedVideoUrl, loadedTranscript, loadedSources, loadedConfidenceScore, loadedReasoning }: VideoAnalysisProps = {}) => {
  const router = useRouter();
  const { userInput } = useContext(AppContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [selectedClaimIndex, setSelectedClaimIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const [confidenceScore, setConfidenceScore] = useState(loadedConfidenceScore ?? mockVideoData.confidenceScores);
  const [reasoning, setReasoning] = useState(loadedReasoning || mockVideoData.reasoning);
  const [toggleInfo, setToggleInfo] = useState(false);
  const confidenceInfo = confidenceScore !== -1 && confidenceScore !== null ? getConfidenceInfo(confidenceScore) : null;

  const videoUrl = loadedVideoUrl || userInput;

  const handleInfoToggle = () => {
    setToggleInfo(!toggleInfo);
  };

  const initialTranscript = loadedTranscript && loadedTranscript.length > 0
    ? loadedTranscript
    : mockVideoData.transcript;

  const initialSources = (() => {
    // If we have loaded sources from localStorage, use them directly (they contain real OpenAI data)
    if (loadedSources && loadedSources.length > 0) {
      console.log("Using loaded sources from localStorage:", loadedSources.length, "source groups");
      return loadedSources;
    }
    // Otherwise, if we have a loaded transcript without sources, generate dummy ones
    if (loadedTranscript && loadedTranscript.length > 0) {
      const claimsInTranscript = loadedTranscript.filter((seg) => seg.claim);
      const generatedSources = claimsInTranscript.map((seg, index) =>
        generateSourcesForClaim(seg.claim || "", index)
      );
      return generatedSources.length > 0 ? generatedSources : mockVideoData.sourcesList;
    }
    return mockVideoData.sourcesList;
  })();

  const [transcript, setTranscript] = useState<TranscriptSegment[]>(initialTranscript);
  const [sources, setSources] = useState<SourceGroup[]>(initialSources);

  // Debug: Log whenever sources state changes
  useEffect(() => {
    console.log("===== SOURCES STATE UPDATED =====");
    console.log("Sources count:", sources.length);
    if (sources.length > 0) {
      console.log("First source:", sources[0]);
      if (sources[0]?.sources?.[0]) {
        console.log("First source URL:", sources[0].sources[0].url);
      }
    }
    console.log("=================================");
  }, [sources]);

  useEffect(() => {
    const urlToUse = loadedVideoUrl || userInput;
    if (!urlToUse) return;

    if (loadedTranscript && loadedTranscript.length > 0 && loadedSources && loadedSources.length > 0) {
      console.log("Using cached transcript and sources from localStorage:", loadedTranscript.length, "segments,", loadedSources.length, "source groups");
      return;
    }

    const loadTranscript = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching transcript from API for:", urlToUse);
      const result = await fetchYoutubeTranscript(urlToUse);

      let finalSources: SourceGroup[] = mockVideoData.sourcesList;
      let finalTranscript: TranscriptSegment[];
      let finalConfidenceScore: number = mockVideoData.confidenceScores;
      let finalReasoning: string = mockVideoData.reasoning;

      if (result.error) {
        setError(result.error);
        setTranscript(mockVideoData.transcript);
        setSources(mockVideoData.sourcesList);
        finalTranscript = mockVideoData.transcript;
      } else if (result.segments && result.segments.length > 0) {
        console.log("Received transcript with", result.segments.length, "segments");

        // Call OpenAI to analyze transcript and identify claims
        try {
          console.log("Calling OpenAI to analyze video transcript...");
          const analysisResult = await analyzeVideoTranscript(result.videoId, result.segments);

          // Use OpenAI's analyzed segments (with real claims)
          console.log("OpenAI analysis complete:", analysisResult.segments.length, "segments with", analysisResult.sourcesList.length, "claims");
          console.log("First source from OpenAI:", analysisResult.sourcesList[0]);
          console.log("About to call setSources with OpenAI data...");
          setTranscript(analysisResult.segments);
          setSources(analysisResult.sourcesList);
          console.log("setSources called with", analysisResult.sourcesList.length, "source groups");
          finalTranscript = analysisResult.segments;
          finalSources = analysisResult.sourcesList;

          // Update confidence scores from OpenAI
          setConfidenceScore(analysisResult.confidenceScores);
          setReasoning(analysisResult.reasoning);
          finalConfidenceScore = analysisResult.confidenceScores;
          finalReasoning = analysisResult.reasoning;
        } catch (error) {
          console.error("OpenAI analysis failed, using raw transcript:", error);
          setError("Failed to analyze transcript with AI. Showing raw transcript.");
          setTranscript(result.segments);
          finalTranscript = result.segments;
          setSources([]);
          finalSources = [];
        }
      } else {
        setTranscript(mockVideoData.transcript);
        setSources(mockVideoData.sourcesList);
        finalTranscript = mockVideoData.transcript;
      }
      setLoading(false);

      const analysisData: TextAnalysisResponse = {
        confidenceScores: finalConfidenceScore,
        reasoning: finalReasoning,
        htmlContent: finalTranscript.map(s => s.text).join(' ') || 'Video transcript',
        sourcesList: finalSources
      };

      console.log("Saving to history - segments:", finalTranscript.length, "confidence:", finalConfidenceScore, "reasoning:", finalReasoning);
      const analysisId = saveToHistory(analysisData, 'video', urlToUse, finalTranscript);

      if (!loadedVideoUrl && analysisId && !result.error) {
        router.push(`/video-analysis/${analysisId}`);
      }
    };

    loadTranscript();
  }, [loadedVideoUrl, loadedTranscript, loadedSources, userInput, router]);

  const handleClaimClick = (claimIndex: number) => {
    console.log("===== CLAIM CLICKED DEBUG =====");
    console.log("Claim index:", claimIndex);
    console.log("Total sources in state:", sources.length);
    console.log("Full sources state:", sources);
    console.log("Selected claim data:", sources[claimIndex]);
    if (sources[claimIndex]) {
      console.log("Sources for this claim:", sources[claimIndex].sources);
      sources[claimIndex].sources.forEach((src, idx) => {
        console.log(`  Source ${idx} URL:`, src.url);
      });
    }
    console.log("================================");
    setSelectedClaimIndex(claimIndex);
    setShowSources(true);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlayingChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  // Show full loading page when initially loading (not from cache)
  if (loading && !loadedVideoUrl) {
    return <LoadingPage preview={videoUrl} type="video" />;
  }

  return (
    <>
      {/* Top bar with sidebar trigger */}
      <div className="flex items-center gap-2 p-3 border-b">
        <SidebarTrigger />
      </div>

      {/* Two column layout: Video+Transcript | Confidence+Sources */}
      <div className="flex flex-row gap-4 px-6 h-[calc(100vh-53px)]">

        {/* Left Column - Video Player + Transcript */}
        <div className='flex-grow flex flex-col h-full overflow-hidden'>
          <div className="flex flex-col items-center">
            <VideoPlayer key={videoUrl} videoUrl={videoUrl} onTimeUpdate={handleTimeUpdate} onPlayingChange={handlePlayingChange} />
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircleIcon />
              <AlertTitle>Error loading transcript: {error}</AlertTitle>
            </Alert>
          )}
          <div className="flex-1 overflow-y-auto mt-4" ref={transcriptScrollRef}>
            {!loading && (
              <Transcript
                segments={transcript}
                currentTime={currentTime}
                onClaimClick={handleClaimClick}
                scrollContainerRef={transcriptScrollRef}
                isPlaying={isPlaying}
              />
            )}
          </div>
        </div>

        {/* Right Column - Confidence + Source Cards */}
        <div className="w-1/3 min-w-[250px] max-w-[550px] flex-shrink-0">
          <div className="flex flex-col gap-8 justify-between h-full">
            <div className="content-box flex flex-col p-4">
              <p className="text-left font-bold mb-1">
                Overall verifiability score {confidenceScore === -1 || confidenceScore === null ? "--" : confidenceScore}% <InfoIcon className="inline-block align-text-bottom cursor-pointer" size={20} onClick={handleInfoToggle} />
              </p>
              <ProgressiveBar
                className="mb-4"
                progress={confidenceScore === -1 || confidenceScore === null ? 0 : confidenceScore}
              />
              {toggleInfo && (
                <>
                  <div className={`mb-4 rounded-xl border ${toneStyles[confidenceInfo?.tone || "neutral"]} px-4 py-3 text-left`}>
                    <p className="text-sm leading-relaxed text-stone-700">
                      <span className="font-semibold text-amber-900">What this score means:</span> {confidenceInfo ? confidenceInfo.description : "This score reflects the overall confidence in the claim based on the available evidence. Higher scores indicate stronger support from credible sources, while lower scores suggest limited or conflicting evidence."}
                    </p>
                  </div>
                  <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-left">
                    <p className="text-sm leading-relaxed text-stone-700">
                      <span className="font-semibold text-blue-900">What to do:</span> {confidenceInfo ? confidenceInfo.action : "Use this score as a general guide to the reliability of the claim. For important or high-stakes claims, consider reviewing the supporting sources and reasoning in detail, especially if the score is not very high."}
                    </p>
                  </div>
                </>
              )}
              <p className="text-left font-bold mb-1"><SparklesIcon className="inline-block" size={15} />AI Reasoning Summary</p>
              {confidenceScore === -1 ?
                <div className="pt-2 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-4" />
                  ))}
                  <Skeleton className="h-4 w-[250px]" />
                </div>
                : <p className="text-left text-sm">
                  {reasoning}
                </p>}
            </div>

            {showSources && selectedClaimIndex !== null && sources[selectedClaimIndex] ? (
              <div className="relative mb-6 flex flex-col">
                <SourceCard
                  index={selectedClaimIndex}
                  key={selectedClaimIndex}
                  claim={sources[selectedClaimIndex].claim}
                  claimType={mapClaimType(sources[selectedClaimIndex].claimType)}
                  confidenceReason={sources[selectedClaimIndex].confidenceReason}
                  ratingPercent={Math.round(sources[selectedClaimIndex].ratingPercent)}
                  confidenceCeiling={sources[selectedClaimIndex].confidenceCeiling ?? 95}
                  aiLimitation={sources[selectedClaimIndex].aiLimitation ?? ""}
                  sources={sources[selectedClaimIndex].sources}
                />
              </div>
            ) : (
              <div className="content-box p-6 text-center">
                {confidenceScore !== -1 && <p className="text-gray-500 text-sm">
                  Click on a highlighted claim in the transcript to see sources
                </p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoAnalysis;
