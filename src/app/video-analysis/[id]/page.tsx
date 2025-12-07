"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoAnalysis from "@/components/VideoAnalysis";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
  transcript?: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    claim?: string;
    claimIndex?: number;
  }>;
};

export default function VideoAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<AnalysisHistoryItem['transcript'] | null>(null);
  const [sources, setSources] = useState<TextAnalysisResponse['sourcesList'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id !== currentId) {
      setVideoUrl(null);
      setTranscript(null);
      setIsLoading(true);
      setNotFound(false);
      setCurrentId(params.id as string);
    }

    const loadAnalysis = () => {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) {
          const history: AnalysisHistoryItem[] = JSON.parse(saved);
          const analysis = history.find(item => item.id === params.id);

          if (analysis && analysis.type === 'video' && analysis.videoUrl) {
            setVideoUrl(analysis.videoUrl);
            setTranscript(analysis.transcript || null);
            setSources(analysis.data?.sourcesList || null);
            console.log("Loaded sources from localStorage:", analysis.data?.sourcesList);
            setNotFound(false);
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
  }, [params.id, currentId]);

  const handleSelectAnalysis = (id: string, type: 'text' | 'video') => {
    if (type === 'video') {
      router.push(`/video-analysis/${id}`);
    } else {
      router.push(`/analysis/${id}`);
    }
  };

  const handleNewAnalysis = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <HistorySidebar
          onSelectAnalysisAction={handleSelectAnalysis}
          onNewAnalysisAction={handleNewAnalysis}
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
          onSelectAnalysisAction={handleSelectAnalysis}
          onNewAnalysisAction={handleNewAnalysis}
        />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Video Analysis Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The video analysis you&apos;re looking for doesn&apos;t exist or has been deleted.
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
        onSelectAnalysisAction={handleSelectAnalysis}
        onNewAnalysisAction={handleNewAnalysis}
      />
      <SidebarInset>
        <VideoAnalysis key={params.id as string} loadedVideoUrl={videoUrl} loadedTranscript={transcript} loadedSources={sources} />
      </SidebarInset>
    </SidebarProvider>
  );
}
