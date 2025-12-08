import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate: (currentTime: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
}

const VideoPlayer = ({ videoUrl, onTimeUpdate, onPlayingChange }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayingChangeRef = useRef(onPlayingChange);

  // Keep refs updated
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onPlayingChangeRef.current = onPlayingChange;
  }, [onPlayingChange]);

  // Extract YouTube video ID from URL
  const getYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const videoId = getYoutubeId(videoUrl);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    const onPlayerReady = () => {
      // Start updating time every 100ms
      timeUpdateIntervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          onTimeUpdateRef.current(time);
        }
      }, 100);
    };

    const onPlayerStateChange = (event: any) => {
      const isPlaying = event.data === (window as any).YT?.PlayerState?.PLAYING;
      onPlayingChangeRef.current?.(isPlaying);
    };

    const initPlayer = () => {
      if (iframeRef.current && videoId) {
        playerRef.current = new (window as any).YT.Player(iframeRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // Clean up interval
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      // Clean up player
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  return (
    <div className="flex flex-col w-full">
      {/* Video Container */}
      <div
        className="bg-black rounded-lg overflow-hidden mt-[30px]"
        style={{
          minWidth: '400px',
          aspectRatio: '16 / 9',
        }}
      >
        <div
          ref={iframeRef}
        />
      </div>

    </div>
  );
};

export default VideoPlayer;