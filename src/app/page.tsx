"use client"

import Main from '@/components/Main';
import VideoAnalysis from '@/components/VideoAnalysis';
import TextAnalysis from '@/components/TextAnalysis';
import { AppContext, Screen } from '@/contexts/AppContext';
import React, { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { HistorySidebar } from "@/components/HistorySidebar";
import { TextAnalysisResponse } from "@/hooks/anaysis";
import { useRouter } from "next/navigation";

const HISTORY_STORAGE_KEY = 'analysisHistory';

type AnalysisHistoryItem = {
  id: string;
  timestamp: number;
  preview: string;
  data: TextAnalysisResponse;
  type?: 'text' | 'video';
  videoUrl?: string;
};

export default function App() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MAIN);
  const [loadedAnalysisData, setLoadedAnalysisData] = useState<TextAnalysisResponse | null>(null);

  const handleSelectAnalysis = (data: TextAnalysisResponse) => {
    // find ID and nav
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
    setLoadedAnalysisData(null);
    setUserInput("");
    setCurrentScreen(Screen.MAIN);
  };

  const renderScreen = (): React.ReactElement => {
    switch (currentScreen) {
      case Screen.MAIN:
        return <Main />;
      case Screen.VIDEO_ANALYSIS:
        return <VideoAnalysis />;
      case Screen.TEXT_ANALYSIS:
        return <TextAnalysis loadedData={loadedAnalysisData} onDataLoaded={() => setLoadedAnalysisData(null)} />;
      default:
        return <Main />;
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <HistorySidebar
        onSelectAnalysis={handleSelectAnalysis}
        onNewAnalysis={handleNewAnalysis}
      />
      <SidebarInset>
        <AppContext.Provider value={{ userInput, currentScreen, setUserInput, setCurrentScreen }}>
          {renderScreen()}
        </AppContext.Provider>
      </SidebarInset>
    </SidebarProvider>
  )
}


