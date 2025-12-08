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

export default function App() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MAIN);
  const [loadedAnalysisData, setLoadedAnalysisData] = useState<TextAnalysisResponse | null>(null);

  const handleSelectAnalysis = (id: string, type: 'text' | 'video') => {
    if (type === 'video') {
      router.push(`/video-analysis/${id}`);
    } else {
      router.push(`/analysis/${id}`);
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
        onSelectAnalysisAction={handleSelectAnalysis}
        onNewAnalysisAction={handleNewAnalysis}
      />
      <SidebarInset>
        <AppContext.Provider value={{ userInput, currentScreen, setUserInput, setCurrentScreen }}>
          {renderScreen()}
        </AppContext.Provider>
      </SidebarInset>
    </SidebarProvider>
  )
}


