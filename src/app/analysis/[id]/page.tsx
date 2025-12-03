"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TextAnalysis from "@/components/TextAnalysis";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { HistorySidebar } from "@/components/HistorySidebar";
import LoadingPage from "@/components/ui/loading-page";
import { TextAnalysisResponse } from "@/hooks/anaysis";

const HISTORY_STORAGE_KEY = 'analysisHistory';

type AnalysisHistoryItem = {
  id: string;
  timestamp: number;
  preview: string;
  data: TextAnalysisResponse;
  type?: 'text' | 'video';
  videoUrl?: string;
};

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<TextAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadAnalysis = () => {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) {
          const history: AnalysisHistoryItem[] = JSON.parse(saved);
          const analysis = history.find(item => item.id === params.id);

          if (analysis) {
            setAnalysisData(analysis.data);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error loading analysis:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadAnalysis();
    }
  }, [params.id]);

  const handleSelectAnalysis = (data: TextAnalysisResponse) => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const history: AnalysisHistoryItem[] = JSON.parse(saved);
        const analysis = history.find(item =>
          item.data.confidenceScores === data.confidenceScores &&
          item.data.reasoning === data.reasoning
        );

        if (analysis) {
          if (analysis.type === 'video') {
            router.push(`/video-analysis/${analysis.id}`);
          } else {
            router.push(`/analysis/${analysis.id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error selecting analysis:", error);
    }
  };

  const handleNewAnalysis = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <HistorySidebar
          onSelectAnalysis={handleSelectAnalysis}
          onNewAnalysis={handleNewAnalysis}
        />
        <SidebarInset>
          <LoadingPage />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (notFound) {
    return (
      <SidebarProvider defaultOpen={true}>
        <HistorySidebar
          onSelectAnalysis={handleSelectAnalysis}
          onNewAnalysis={handleNewAnalysis}
        />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Analysis Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The analysis you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
              <button
                onClick={handleNewAnalysis}
                className="text-primary hover:underline"
              >
                Go to Home
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <HistorySidebar
        onSelectAnalysis={handleSelectAnalysis}
        onNewAnalysis={handleNewAnalysis}
      />
      <SidebarInset>
        <div className="flex items-center gap-2 p-3 border-b">
          <SidebarTrigger />
        </div>
        <TextAnalysis loadedData={analysisData} onDataLoaded={() => {}} />
      </SidebarInset>
    </SidebarProvider>
  );
}
