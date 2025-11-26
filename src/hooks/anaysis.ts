
export type Source = {
  title: string;
  claimReference?: string;
  url: string;
  ratingStance: "Mostly Support" | "Partially Support" | "Opposite";
  snippet: string;
  datePosted: string;
};

export type SourceGroup = {
  claim: string;
  confidenceReason: string;
  ratingPercent: number;
  sources: Source[];
};


export type TextAnalysisResponse = {
  confidenceScores: number;
  reasoning: string;
  htmlContent: string;
  sourcesList: SourceGroup[];
};
