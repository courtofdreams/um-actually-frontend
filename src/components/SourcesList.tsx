// ─────────────────────────────────────────────────────────────────
// Example: how to render sourcesList from the updated backend
// in your results page / right panel component
// ─────────────────────────────────────────────────────────────────

import SourceCard from "./SourceCard";

type AnalysisResult = {
    confidenceScores: number;
    reasoning: string;
    htmlContent: string;
    sourcesList: Array<{
        claim: string;
        claimType: "verifiable" | "anonymous_source" | "subjective_inference";
        confidenceReason: string;
        ratingPercent: number;
        confidenceCeiling: number;
        aiLimitation: string;
        sources: Array<{
            title: string;
            url: string;
            ratingStance: string;
            snippet?: string;
            datePosted?: string;
            claimReference?: string;
        }>;
    }>;
};

// Drop this wherever you render the right panel
export const SourcesList = ({ result }: { result: AnalysisResult }) => {
    return (
        <div className="flex flex-col gap-4 p-4">
            {result.sourcesList.map((item, i) => (
                <SourceCard
                    key={i}
                    index={i}
                    // ── claim-level (new fields) ──
                    claim={item.claim}
                    claimType={item.claimType}
                    confidenceReason={item.confidenceReason}
                    ratingPercent={item.ratingPercent}
                    confidenceCeiling={item.confidenceCeiling}
                    aiLimitation={item.aiLimitation}
                    // ── sources array ──
                    sources={item.sources}
                />
            ))}
        </div>
    );
};