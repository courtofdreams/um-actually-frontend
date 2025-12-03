"use client"

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TextAnalysisResponse } from "@/hooks/anaysis";
import { FileTextIcon, TrashIcon, PlusIcon, FilePlayIcon } from "lucide-react";
import { DesignMark } from "@/components/assets/DesignMark";

const HISTORY_STORAGE_KEY = 'analysisHistory';

export type AnalysisHistoryItem = {
  id: string;
  timestamp: number;
  preview: string;
  data: TextAnalysisResponse;
  type?: 'text' | 'video';
  videoUrl?: string;
};

function loadHistoryFromStorage(): AnalysisHistoryItem[] {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading history:", error);
  }
  return [];
}

export function HistorySidebar({ onSelectAnalysis, onNewAnalysis }: {
  onSelectAnalysis: (data: TextAnalysisResponse) => void;
  onNewAnalysis: () => void;
}) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() => {
    return loadHistoryFromStorage();
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setHistory(loadHistoryFromStorage());
    };

    window.addEventListener('storage', handleStorageChange);
    // same-window updates
    window.addEventListener('historyUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('historyUpdated', handleStorageChange);
    };
  }, []);

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = history.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-start gap-2.5 px-2 py-0.5">
            <DesignMark className="h-5.5" fill="#000"/>
            <p className="text-2xl font-bold tracking-tight">Um, Actually?</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className={'p-0'}>

          <SidebarMenuItem key={'new-entry'} className={'p-2'}>
            <SidebarMenuButton className={""} asChild>
              <a onClick={onNewAnalysis} className={"cursor-pointer"}>
                <PlusIcon />
                <span>Start New Analysis</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Separator />

          <SidebarGroupLabel className={"ms-2 mt-2"}>Recent Analyses</SidebarGroupLabel>
          <SidebarGroupContent className={"p-2"}>
            <SidebarMenu className={"gap-2"}>
              {history.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No analyses saved yet :(
                </div>
              ) : (
                history.map((item) => (
                  <SidebarMenuItem key={item.id} className="">
                    <SidebarMenuButton
                      onClick={() => onSelectAnalysis(item.data)}
                      className="h-10 pr-8"
                    >
                      {item.type === 'video' ?
                          <FilePlayIcon className="mt-0.5 flex-shrink-0" /> :
                          <FileTextIcon className="mt-0.5 flex-shrink-0" />
                      }
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="truncate text-left">
                            {item.preview}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => deleteItem(item.id, e)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7 hover:bg-destructive/10 transition-opacity"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function saveToHistory(data: TextAnalysisResponse, type: 'text' | 'video' = 'text', videoUrl?: string): string | null {
  try {
    const history = localStorage.getItem(HISTORY_STORAGE_KEY);
    const historyArray: AnalysisHistoryItem[] = history ? JSON.parse(history) : [];

    // Create preview text from htmlContent (strip HTML tags)
    const preview = data.htmlContent
      .replace(/<[^>]*>/g, '')
      .substring(0, 80)
      .trim() + (data.htmlContent.length > 80 ? '...' : '');

    // Check if this analysis already exists in history (compare by preview and confidence score)
    const existingAnalysis = historyArray.find(item =>
      item.preview === preview &&
      item.data.confidenceScores === data.confidenceScores &&
      item.data.reasoning === data.reasoning &&
      item.type === type
    );

    if (existingAnalysis) {
      console.log("Analysis already exists in history, returning existing ID");
      return existingAnalysis.id;
    }

    const newItem: AnalysisHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      preview,
      data,
      type,
      ...(videoUrl && { videoUrl })
    };

    historyArray.unshift(newItem);

    const trimmedHistory = historyArray.slice(0, 50);

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));

    window.dispatchEvent(new Event('historyUpdated'));

    return newItem.id;
  } catch (error) {
    console.error("Error saving to history:", error);
    return null;
  }
}
