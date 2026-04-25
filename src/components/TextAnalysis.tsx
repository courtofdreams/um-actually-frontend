// @ts-ignore
import { useContext, useEffect, useRef, useState } from "react";
import SourceCard from "./SourceCard";
import { ProgressiveBar } from "./ui/progressive-bar";
import useAnalysisAPI from "@/hooks/useAnalysisAPI";
import { AppContext } from "@/contexts/AppContext";
import { TextAnalysisResponse } from "@/hooks/anaysis";
import LoadingPage from "./ui/loading-page";
import { saveToHistory } from "./HistorySidebar";
import { useRouter } from "next/navigation";
import { InfoIcon, SparklesIcon } from "lucide-react";


const LOCAL_STORAGE_KEY = 'textAnalysisData';



type TextAnalysisProps = {
    loadedData?: TextAnalysisResponse | null;
    onDataLoaded?: () => void;
};

type ConfidenceInfo = {
    level: string;
    tone: "positive" | "warning" | "danger" | "neutral";
    title: string;
    description: string;
    action: string;
}

const toneStyles: Record<ConfidenceInfo["tone"], string> = {
    "positive": "bg-green-50/80 border-green-200 text-green-700",
    "warning": "bg-yellow-50/80 border-yellow-200 text-yellow-700",
    "danger": "bg-red-50/80 border-red-200 text-red-700",
    "neutral": "bg-pink-50/80 border-pink-200 text-pink-700",
};

const mapClaimType = (claimType?: string): "verifiable" | "anonymous_source" | "subjective_inference" => {
    if (claimType === "anonymous_source") return "anonymous_source";
    if (claimType === "inference" || claimType === "subjective_inference") return "subjective_inference";
    return "verifiable";
};

export const getConfidenceInfo = (score: number): ConfidenceInfo => {
    console.log("Calculating confidence info for score:", score);
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

const TextAnalysis = ({ loadedData, onDataLoaded }: TextAnalysisProps) => {
    const router = useRouter();
    const { userInput } = useContext(AppContext);
    const { getTextAnalysis } = useAnalysisAPI();
    const [showSources, setShowSources] = useState(false);
    const [analysisData, setAnalysisData] = useState<TextAnalysisResponse>();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hasInitialized = useRef(false);
    const [confidenceInfo, setConfidenceInfo] = useState<ConfidenceInfo | null>(null);
    const [toggleInfo, setToggleInfo] = useState(false);

    const handleMarkerClick = (e: Event) => {
        setShowSources(true);
        const target = e.target as HTMLElement;
        console.log("Clicked:", target.textContent);
    };

    const handleInfoToggle = () => {
        setToggleInfo(!toggleInfo);
    }

    const attachMarkers = () => {
        if (!containerRef.current) return;

        const markers = containerRef.current?.querySelectorAll(".marker");

        if (!markers) return;

        markers.forEach((el) => {
            el.addEventListener("click", handleMarkerClick);
        });

        return () => {
            markers.forEach((el) => {
                el.removeEventListener("click", handleMarkerClick);
            });
        };
    }


    const fetchTextAnalysis = async () => {
        setIsLoading(true);
        try {
            const analysisResult = await getTextAnalysis(userInput);
            setAnalysisData(analysisResult);
            if (analysisResult.confidenceScores !== undefined) {
                setConfidenceInfo(getConfidenceInfo(analysisResult.confidenceScores));
            }
            const analysisId = saveToHistory(analysisResult);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(analysisResult));

            if (analysisId) {
                router.push(`/analysis/${analysisId}`);
            }
        } catch (error) {
            setIsError(true);
            console.error("Error fetching text analysis:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("Analysis data updated:", confidenceInfo);
    }, [confidenceInfo]);

    useEffect(() => {
        if (analysisData && !isLoading) {
            attachMarkers();
        }
    }, [analysisData, isLoading]);

    useEffect(() => {
        if (loadedData) {
            setAnalysisData(loadedData);
            if (loadedData.confidenceScores !== undefined) {
                setConfidenceInfo(getConfidenceInfo(loadedData.confidenceScores));
            }
            setShowSources(false);
            if (onDataLoaded) {
                onDataLoaded();
            }
        }
    }, [loadedData]);

    // Init fetch
    useEffect(() => {
        if (!loadedData && userInput && !hasInitialized.current) {
            hasInitialized.current = true;
            fetchTextAnalysis();
        }
    }, []);

    return (
        <>
            {isLoading ? <LoadingPage preview={userInput} /> :
                isError ?
                    <div className="p-6">
                        <p className="text-red-500">An error occurred while fetching the analysis. Please try again later.</p>
                    </div> :
                    <div className='p-6 flex flex-row'>
                        <div className={`content-box flex flex-col p-6 mr-4 transition-all duration-500 ease-in-out ${showSources ? "w-1/2 border-r" : "w-full"}`}>
                            <p className="text-left font-bold mb-1">Overall verifiability score {analysisData?.confidenceScores}% <InfoIcon className="inline-block align-text-bottom cursor-pointer" size={20} onClick={handleInfoToggle}/></p>
                            <ProgressiveBar className="mb-4" progress={analysisData?.confidenceScores ?? 0} />
                            {toggleInfo && (
                                <>
                                <div className={`mb-4 rounded-xl border ${toneStyles[confidenceInfo?.tone || "neutral"]} px-4 py-3 text-left`}>
                                    <p className="text-sm leading-relaxed text-stone-700">
                                        <span className={`font-semibold text-${toneStyles[confidenceInfo?.tone || "neutral"].split(' ')[2].replace('bg-', 'text-')}`}>What this score means:</span> {confidenceInfo ? confidenceInfo.description : "This score reflects the overall confidence in the claim based on the available evidence. Higher scores indicate stronger support from credible sources, while lower scores suggest limited or conflicting evidence."}
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
                            <p className="text-left mb-4">{analysisData?.reasoning}</p>
                            <p className="text-left font-bold mb-1">Content</p>
                            <div className="text-left content-box mb-4" ref={containerRef} dangerouslySetInnerHTML={{ __html: analysisData?.htmlContent ?? "" }}></div>
                            <div />
                        </div>
                        {showSources && <div className={` content-box flex flex-col p-6 w-1/2 ml-4 overflow-y-auto transition-all duration-500 ease-in-out 
                            ${showSources ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
                            {analysisData?.sourcesList.map((sourceGroup, index) => (
                                <div key={index} className="mb-6">
                                    <SourceCard
                                        index={index}
                                        key={index}
                                        claim={sourceGroup.claim}
                                        claimType={mapClaimType(sourceGroup.claimType)}
                                        confidenceReason={sourceGroup.confidenceReason}
                                        ratingPercent={Math.round(sourceGroup.ratingPercent)}
                                        confidenceCeiling={sourceGroup.confidenceCeiling ?? 95}
                                        aiLimitation={sourceGroup.aiLimitation ?? ""}
                                        sources={sourceGroup.sources}
                                    />
                                </div>
                            ))}

                        </div>}
                    </div>
            }
        </>
    );
}

export default TextAnalysis;