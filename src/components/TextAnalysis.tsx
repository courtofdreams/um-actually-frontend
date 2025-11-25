// @ts-ignore
import { text } from "@fortawesome/fontawesome-svg-core";
import TopBar from "./TopBar"
import { useEffect, useRef, useState } from "react";
import SourceCard from "./SourceCard";
import ConfidenceCard from "./ConfidenceCard";


const mockData = {
    confidenceScores: 75,
    reasoning: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.,",
    htmlContent: ` Tes
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
Lorem ipsum dolor sit amet, <span class="marker">consectetur adipiscing elit, sed do eiusmod [1]</span> tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

<span class="marker">Lorem ipsum dolor sit amet, consectetur [2]</span> adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>
Lorem ipsum dolor sit amet, <span class="marker"> consectetur adipiscing elit, [3]</span> sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, <span class="marker"> quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea [4]</span> commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

.
    `,
    sourcesList: [
        {
            claim: "[1] Example Source 1",
            confidenceReason: "This is a confidence reasoning for source 1.",
            ratingPercent: 75,
            sources: [
                { title: "BBC news", claimReference: "[1] Example Source 1", url: "https://example.com/source1", ratingStance: "Partial Support", snippet: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", datePosted: "October 4th, 2025" },
                { title: "New York Times", url: "https://example.com/source2", ratingStance: "Oppose", snippet: "This is a snippet from source 2 that supports or refutes the claim.", datePosted: "September 15th, 2023" }
            ]
        },
        {
            claim: "[2] Example Source 2",
            confidenceReason: "This is a confidence reasoning for source 2.",
            ratingPercent: 60,
            sources: [
                { title: "NBC News", url: "https://example.com/source3", ratingStance: "Mostly Support", snippet: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", datePosted: "January 20th, 2024" },
                { title: "CNN News", url: "https://example.com/source4", ratingStance: "Partially Support", snippet: "This is a snippet from source 4 that supports or refutes the claim.", datePosted: "February 10th, 2024" }
            ]

        }, {
            claim: "[3] Example Source 3",
            confidenceReason: "This is a confidence reasoning for source 3.",
            ratingPercent: 85,
            sources: [
                { title: "BBC news", claimReference: "[3] Example Source 3", url: "https://example.com/source5", ratingStance: "Mostly Support", snippet: "This is a snippet from source 5 that supports or refutes the claim.", datePosted: "March 5th, 2024" },
                { title: "New York Times", url: "https://example.com/source6", ratingStance: "Oppose", snippet: "This is a snippet from source 6 that supports or refutes the claim.", datePosted: "April 12th, 2024"       }
            ]
        },
        {
            claim: "[4] Example Source 4",
            confidenceReason: "This is a confidence reasoning for source 4.",
            ratingPercent: 90,
            sources: [
                { title: "NBC News", url: "https://example.com/source7", ratingStance: "Mostly Support", snippet: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", datePosted: "May 18th, 2024" },
                { title: "CNN News", url: "https://example.com/source8", ratingStance: "Partially Support", snippet: "This is a snippet from source 8 that supports or refutes the claim.", datePosted: "June 22nd, 2024" }
            ]

        }
    ]
}

const TextAnalysis = () => {

    const [showSources, setShowSources] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const htmlContent = mockData.htmlContent;

    const handleMarkerClick = (e: Event) => {
        setShowSources(true);
        const target = e.target as HTMLElement;
        console.log("Clicked:", target.textContent);
    };

    useEffect(() => {
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
    }, [htmlContent]);

    return <>
        <TopBar />
        <div className='p-6 flex flex-row'>
            <div className={`content-box flex flex-col p-6 mr-4 transition-all duration-500 ease-in-out ${showSources ? "w-1/2 border-r" : "w-full"}`}>
                <p className="text-left font-bold mb-1">Confidence Score: {mockData.confidenceScores}%</p>
                <div className="progress-bar  mb-4">
                    <div className="progress-fill" style={{ width: `${mockData.confidenceScores}%` }}></div>
                </div>
                <p className="text-left font-bold mb-1">Confident Score Summary (Reasoning)</p>
                <p className="text-left mb-4">{mockData.reasoning}</p>
                <p className="text-left font-bold mb-1">Content</p>
                <div className="text-left content-box mb-4" ref={containerRef} dangerouslySetInnerHTML={{ __html: mockData.htmlContent }}></div>
                <div />
            </div>
            {showSources && <div className={` content-box flex flex-col p-6 w-1/2 ml-4 overflow-y-auto transition-all duration-500 ease-in-out 
                    ${showSources ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>

                {mockData.sourcesList.map((sourceGroup, index) => (
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
    </>;
}

export default TextAnalysis;