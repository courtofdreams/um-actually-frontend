import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StanceBadge, { Stance } from "./StanceBadge";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare";
import { SparklesIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ClaimType = "verifiable" | "anonymous_source" | "subjective_inference";

type Source = {
    title: string;
    url: string;
    ratingStance: string;
    ratingReason?: string;
    snippet?: string;
    datePosted?: string;
    claimReference?: string;
};

type SourceCardProps = {
    // Claim-level fields (new from updated backend)
    claim: string;
    claimType: ClaimType;
    confidenceReason: string;
    ratingPercent: number;
    confidenceCeiling: number;
    aiLimitation: string;

    // Source-level fields (one card = one claim group)
    sources: Source[];

    index: number;
};

// ─────────────────────────────────────────────
// Mappings
// ─────────────────────────────────────────────

const stanceMapping: Record<string, Stance> = {
    "partial support":      "partial",
    "partially support":    "partial",
    "mostly support":       "mostly",
    "mostly":               "mostly",
    "partial":              "partial",
    "weakly":               "weakly",
    "weakly support":       "weakly",
    "insufficient evidence":"insufficient",
};

const logoMapping: Record<string, string> = {
    "BBC news":      "/images/bbc.png",
    "New York Times":"/images/nyt.png",
    "NBC News":      "/images/nbc.png",
    "CNN News":      "/images/cnn.png",
    "Fox News":      "/images/fox.png",
};

// ─────────────────────────────────────────────
// Claim type badge config
// ─────────────────────────────────────────────

const claimTypeConfig: Record<
    ClaimType,
    { label: string; dot: string; bg: string; text: string; border: string }
> = {
    verifiable: {
        label:  "Verifiable claim",
        dot:    "#1050A0",
        bg:     "#E8F2FB",
        text:   "#1050A0",
        border: "transparent",
    },
    anonymous_source: {
        label:  "Anonymous source",
        dot:    "#B85C00",
        bg:     "#FFF3E0",
        text:   "#B85C00",
        border: "rgba(184,92,0,0.18)",
    },
    subjective_inference: {
        label:  "Subjective inference",
        dot:    "#888",
        bg:     "#F1F1F1",
        text:   "#555",
        border: "transparent",
    },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getOutletFromUrl = (url: string): string => {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return "Unknown";
    }
};

const getLogoFromTitle = (title: string): string =>
    logoMapping[title] ?? "/images/undefined-source.png";

/** Split confidenceReason on the backend separator so we can render
 *  the base reason and the AI limitation separately if both are present. */
const splitReason = (raw: string): { base: string; limitation: string | null } => {
    if (!raw) return { base: "", limitation: null };

    const SEP = "\n\n⚠ AI limitation:";
    const idx = raw.indexOf(SEP) ?? -1;
    if (idx === -1) return { base: raw.trim(), limitation: null };
    return {
        base:       raw.slice(0, idx).trim(),
        limitation: raw.slice(idx + SEP.length).trim(),
    };
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Orange filled confidence pill — matches existing design */
const ConfidencePill = ({ pct, ceiling }: { pct: number; ceiling: number }) => {
    const isAtCeiling = pct >= ceiling && ceiling < 95;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap"
            style={{ background: isAtCeiling ? "#D08000" : "#E8540A" }}
        >
            {pct}% Confidence
            {isAtCeiling && (
                <span className="text-[10px] opacity-75 font-normal">
                    (ceiling)
                </span>
            )}
        </span>
    );
};

/** Thin confidence bar with an optional ceiling marker */
const ConfidenceBar = ({
    pct,
    ceiling,
    claimType,
}: {
    pct: number;
    ceiling: number;
    claimType: ClaimType;
}) => {
    const fillColor =
        claimType === "verifiable"
            ? "#E8540A"
            : claimType === "anonymous_source"
            ? "#D08000"
            : "#aaa";

    const showCeiling = ceiling < 95;

    return (
        <div className="relative h-1.5 rounded-full bg-gray-200 overflow-visible mb-4">
            {/* filled portion */}
            <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: fillColor }}
            />
            {/* ceiling marker */}
            {showCeiling && (
                <>
                    <div
                        className="absolute top-[-3px] w-[2px] h-[10px] rounded-sm bg-gray-400"
                        style={{ left: `${ceiling}%` }}
                    />
                    <span
                        className="absolute top-[10px] text-[10px] text-gray-400 -translate-x-1/2 whitespace-nowrap"
                        style={{ left: `${ceiling}%` }}
                    >
                        ceiling {ceiling}%
                    </span>
                </>
            )}
        </div>
    );
};

/** Claim type badge pill */
const ClaimTypeBadge = ({ type }: { type: ClaimType }) => {
    console.log("Rendering ClaimTypeBadge with type:", type);
    const cfg = claimTypeConfig[type];
    console.log("Rendering ClaimTypeBadge with config:", cfg);
    return (
        <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{
                background:   cfg.bg,
                color:        cfg.text,
                border:       `1px solid ${cfg.border}`,
            }}
        >
            <svg width="7" height="7" viewBox="0 0 7 7">
                <circle cx="3.5" cy="3.5" r="3.5" fill={cfg.dot} />
            </svg>
            {cfg.label}
        </span>
    );
};

/** Orange left-border callout for AI limitation */
const AiLimitationCallout = ({ text }: { text: string }) => (
    <div className="mx-3 mb-3 px-3 py-2 rounded-r-md text-[11.5px] leading-relaxed"
         style={{
             background:  "#FFF8F0",
             borderLeft:  "3px solid #E8540A",
             color:       "#7A3800",
         }}
    >
        <span className="font-semibold" style={{ color: "#B85C00" }}>
            ⚠ AI limitation:{" "}
        </span>
        {text}
    </div>
);

/** Confidence reason box */
const ConfidenceReason = ({ text }: { text: string }) => (
    <div className="mx-3 mb-3 px-3 py-2 rounded-md text-[11.5px] leading-relaxed text-gray-500 bg-gray-50 border border-gray-100">
        <p className="mb-1 text-[11px] font-semibold text-gray-700">
            <SparklesIcon className="mr-1 inline-block" size={12} />
            Confidence Reason
        </p>
        {text}
    </div>
);

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const SourceCard = ({
    claim,
    claimType,
    confidenceReason,
    ratingPercent,
    confidenceCeiling,
    aiLimitation,
    sources,
    index,
}: SourceCardProps) => {
    const { base: baseReason, limitation } = splitReason(confidenceReason);

    // The limitation string to display — prefer the dedicated `aiLimitation`
    // field; fall back to the one parsed out of confidenceReason if present.
    const limitationText = aiLimitation || limitation || null;

    return (
        <div
            className="rounded-xl bg-white border border-gray-100 shadow-[-1px_0px_14px_-4px_rgba(0,0,0,0.1)] overflow-hidden -mt-3"
            style={{ zIndex: index + 1, position: "relative" }}
        >
            {/* ── Claim header ── */}
            <div className="p-3 flex items-start gap-3 border-b border-gray-100">
                {/* index badge */}
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0 mt-0.5">
                    [{index + 1}]
                </div>

                <div className="flex-1 min-w-0">
                    {/* claim quote */}
                    <p className="text-sm text-gray-900 leading-snug mb-2 italic">
                        "{claim}"
                    </p>

                    {/* claim type badge */}
                    <div className="mb-2">
                        <ClaimTypeBadge type={claimType} />
                    </div>

                    {/* confidence bar */}
                    <ConfidenceBar
                        pct={ratingPercent}
                        ceiling={confidenceCeiling}
                        claimType={claimType}
                    />
                </div>

                {/* confidence pill */}
                <ConfidencePill pct={ratingPercent} ceiling={confidenceCeiling} />
            </div>

            {/* ── AI limitation callout (only for non-verifiable claims) ── */}
            {limitationText && claimType !== "verifiable" && (
                <div className="pt-3">
                    <AiLimitationCallout text={limitationText} />
                </div>
            )}

            {/* ── Confidence reason ── */}
            {baseReason && (
                <ConfidenceReason text={baseReason} />
            )}

            {/* ── Sources ── */}
            {sources ? sources.map((source, si) => (
                <SingleSource
                    key={si}
                    source={source}
                    sourceIndex={si}
                    totalSources={sources.length}
                />
            )): <></>}
        </div>
    );
};

// ─────────────────────────────────────────────
// Single source row (hover-expand kept from original)
// ─────────────────────────────────────────────

const SingleSource = ({
    source,
    sourceIndex,
    totalSources,
}: {
    source: Source;
    sourceIndex: number;
    totalSources: number;
}) => {
    const openLink = () => {
        if (source.url) window.open(source.url, "_blank");
    };

    const stance = stanceMapping[source.ratingStance.toLowerCase()] ?? "undefined";

    return (
        <div
            className={`group p-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                sourceIndex < totalSources - 1 ? "border-b border-gray-100" : ""
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <img
                        className="w-8 h-8 rounded-full"
                        src={getLogoFromTitle(source.title)}
                        alt=""
                    />
                    <div>
                        <div className="text-left text-sm font-semibold text-gray-900 leading-snug">
                            {source.title}
                        </div>
                        {source.datePosted && (
                            <div className="text-left text-xs text-gray-400 mt-0.5">
                                {source.datePosted}
                            </div>
                        )}
                    </div>
                </div>

                <StanceBadge stance={stance} />
            </div>

            {/* Hover-expand (kept from original) */}
            <div className="px-4 py-0 overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-[400px] group-hover:opacity-100 group-hover:py-3">
                {source.claimReference && (
                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                        {source.claimReference}
                    </h2>
                )}
                {source.snippet && (
                    <p className="text-left text-sm leading-relaxed text-gray-600 mb-3">
                        {source.snippet}
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" className="rounded-full">
                                See detailed information
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{source.title}</DialogTitle>
                                <DialogDescription>
                                    Detailed rating of the source
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {source.claimReference && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">Claim</h4>
                                        <p className="text-md text-center italic text-gray-900">
                                            "{source.claimReference}"
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Rating</h4>
                                    <StanceBadge stance={stance} />
                                </div>
                                {source.snippet && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">Excerpt</h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {source.snippet}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <div className="flex w-full items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Source: {getOutletFromUrl(source.url)}
                                    </span>
                                    <Button
                                        onClick={openLink}
                                        variant="default"
                                        className="rounded-full"
                                    >
                                        <FontAwesomeIcon
                                            className="h-4 w-4"
                                            icon={faArrowUpRightFromSquare}
                                        />
                                        Read article
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={openLink}
                        variant="default"
                        size="sm"
                        className="rounded-full"
                    >
                        <FontAwesomeIcon
                            className="h-4 w-4"
                            icon={faArrowUpRightFromSquare}
                        />
                        Read article
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SourceCard;