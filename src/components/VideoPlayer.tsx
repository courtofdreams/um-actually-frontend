import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate: (currentTime: number) => void;
}

const VideoPlayer = ({ videoUrl, onTimeUpdate }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);

  // Extract YouTube video ID from URL
  const getYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const videoId = getYoutubeId(videoUrl);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (iframeRef.current) {
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

    return () => {
      document.body.removeChild(tag);
    };
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());
    // Start updating time
    const interval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate(time);
      }
    }, 100);
    return () => clearInterval(interval);
  };

  const onPlayerStateChange = (event: any) => {
    const playState = event.data;
    // 1 = playing, 2 = paused
    setIsPlaying(playState === (window as any).YT.PlayerState.PLAYING);
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

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Video Container */}
      <div
        className="bg-black rounded-lg overflow-hidden mt-[30px] mx-auto"
        style={{
          width: '60%',
          minWidth: '400px',
          aspectRatio: '16 / 9',
        }}
      >
        <div
          ref={iframeRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Controls */}
    </div>
  );
};

export default VideoPlayer;