
export type Source = {
  title: string;
  claimReference?: string;
  url: string;
  ratingStance: "Mostly Support" | "Partially Support" | "Weakly Support" | "Insufficient Evidence" ;
  snippet: string;
  datePosted: string;
};

export type SourceGroup = {
  claim: string;
  confidenceReason: string;
  ratingPercent: number;
  aiLimitation: string;
  claimType: "verifiable" | "anonymous_source" | "inference";
  confidenceCeiling: number;
  sources: Source[];
};


export type TextAnalysisResponse = {
  confidenceScores: number;
  reasoning: string;
  htmlContent: string;
  sourcesList: SourceGroup[];
};
