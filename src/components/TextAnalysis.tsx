// @ts-ignore
import TopBar from "./TopBar"
import { useContext, useEffect, useRef, useState } from "react";
import SourceCard from "./SourceCard";
import ConfidenceCard from "./ConfidenceCard";
import { ProgressiveBar } from "./ui/progressive-bar";
import useAnalysisAPI from "@/hooks/useAnalysisAPI";
import { AppContext } from "@/contexts/AppContext";
import { TextAnalysisResponse } from "@/hooks/anaysis";
import LoadingPage from "./ui/loading-page";

// TODO: Add going back button to the top bar
const TextAnalysis = () => {
    const { userInput } = useContext(AppContext);
    const [showSources, setShowSources] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [analysisData, setAnalysisData] = useState<TextAnalysisResponse>();
    const [isLoading, setIsLoading] = useState(false);
    const { getTextAnalysis } = useAnalysisAPI();
    const [isError, setIsError] = useState(false);

    const handleMarkerClick = (e: Event) => {
        setShowSources(true);
        const target = e.target as HTMLElement;
        console.log("Clicked:", target.textContent);
    };

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
        } catch (error) {
            setIsError(true);
            console.error("Error fetching text analysis:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (analysisData && isLoading === false) {
            attachMarkers();
        }

    }, [analysisData, isLoading]);

    useEffect(() => {
        if (userInput) {
            fetchTextAnalysis();
        }
    }, []);

    return <>
        <TopBar />
        {isLoading ? <LoadingPage /> :
            isError ?
                <div className="p-6">
                    <p className="text-red-500">An error occurred while fetching the analysis. Please try again later.</p>
                </div> :
                <div className='p-6 flex flex-row'>
                    <div className={`content-box flex flex-col p-6 mr-4 transition-all duration-500 ease-in-out ${showSources ? "w-1/2 border-r" : "w-full"}`}>
                        <p className="text-left font-bold mb-1">Confidence Score: {analysisData?.confidenceScores}%</p>
                        <ProgressiveBar className="mb-4" progress={analysisData?.confidenceScores ?? 0} />
                        <p className="text-left font-bold mb-1">Confident Score Summary (Reasoning)</p>
                        <p className="text-left mb-4">{analysisData?.reasoning}</p>
                        <p className="text-left font-bold mb-1">Content</p>
                        <div className="text-left content-box mb-4" ref={containerRef} dangerouslySetInnerHTML={{ __html: analysisData?.htmlContent ?? "" }}></div>
                        <div />
                    </div>
                    {showSources && <div className={` content-box flex flex-col p-6 w-1/2 ml-4 overflow-y-auto transition-all duration-500 ease-in-out 
                    ${showSources ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
                        {analysisData?.sourcesList.map((sourceGroup, index) => (
                            <div key={index} className="mb-6">
                                <div className="relative flex flex-col my-2">
                                    <ConfidenceCard index={index} text={sourceGroup.claim} confidence={sourceGroup.ratingPercent} confidenceReason={sourceGroup.confidenceReason} />
                                    {sourceGroup.sources.map((source, srcIndex) => (
                                        <SourceCard
                                            index={srcIndex}
                                            zIndex={sourceGroup.sources.length - srcIndex}
                                            key={srcIndex} title={source.title} url={source.url} ratingStance={source.ratingStance} snippet={source.snippet} datePosted={source.datePosted} claimReference={source.claimReference}></SourceCard>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>}
                </div>
        }
    </>;
}

export default TextAnalysis;