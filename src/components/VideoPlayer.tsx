import { useEffect, useRef, /*useState*/ } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate: (currentTime: number) => void;
}

const VideoPlayer = ({ videoUrl, onTimeUpdate }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract YouTube video ID from URL
  const getYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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
          onTimeUpdate(time);
        }
      }, 100);
    };

    const initPlayer = () => {
      if (iframeRef.current && videoId) {
        playerRef.current = new (window as any).YT.Player(iframeRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          events: {
            onReady: onPlayerReady,
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
  }, [videoId, onTimeUpdate]);

  // TODO: Is this needed?
/*
  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());
    // Start updating time
    setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate(time);
      }
    }, 100);
  };

  const onPlayerStateChange = (event: any) => {
    const playState = event.data;
    setIsPlaying(playState === (window as any).YT?.PlayerState?.PLAYING);
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
      onTimeUpdate(newTime);
    }
  };
*/

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