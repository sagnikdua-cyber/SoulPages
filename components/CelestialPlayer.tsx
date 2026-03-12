import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';

interface CelestialPlayerProps {
  videoId: string | null;
  isPlaying: boolean;
  onStateChange?: (state: number) => void;
}

export default function CelestialPlayer({ videoId, isPlaying, onStateChange }: CelestialPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    if (playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (err) {
        console.error('CelestialPlayer playback error:', err);
      }
    }
  }, [isPlaying, videoId]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (isPlaying) {
      try {
        event.target.playVideo();
      } catch (err) {
        console.error('CelestialPlayer onReady error:', err);
      }
    }
  };

  const onError: YouTubeProps['onError'] = (event) => {
    console.error('YouTube Player Error:', event.data);
    // You could pass this up to show an error message in the UI
  };

  const handleStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (onStateChange) {
      onStateChange(event.data);
    }
  };

  if (!videoId) return null;

  const opts: YouTubeProps['opts'] = {
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
    },
  };

  return (
    <div className="fixed bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
      <YouTube 
        videoId={videoId} 
        opts={opts} 
        onReady={onReady} 
        onStateChange={handleStateChange} 
        onError={onError}
      />
    </div>
  );
}
