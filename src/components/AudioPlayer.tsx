
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Repeat, Volume2, VolumeX, AlertCircle, RefreshCcw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFirestore, incrementPlayCountNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

interface AudioPlayerProps {
  track: {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    playCount?: number;
  };
}

export function AudioPlayer({ track }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasIncremented, setHasIncremented] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firestore = useFirestore();

  // Reset state when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    setHasIncremented(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [track.id, track.audioUrl]);

  const getCleanAudioUrl = (url: string) => {
    if (!url) return "";
    let cleanUrl = url.trim();
    
    // Handle local files
    if (cleanUrl.toLowerCase().startsWith("/public/")) {
      return cleanUrl.substring(7);
    }

    // High-compatibility Google Drive handler
    // Browsers often block drive.google.com direct streams due to security policies.
    // docs.google.com/uc?export=download is generally more permissive for <audio> elements.
    if (cleanUrl.includes("drive.google.com")) {
      const idMatch = cleanUrl.match(/\/d\/([^\/\?#]+)/) || cleanUrl.match(/[?&]id=([^&#]+)/);
      const resourceKeyMatch = cleanUrl.match(/[?&]resourcekey=([^&#]+)/);

      if (idMatch && idMatch[1]) {
        // We use docs.google.com which has better CORS/stream support for native audio tags
        let baseUrl = `https://docs.google.com/uc?id=${idMatch[1]}&export=download&confirm=t`;
        
        if (resourceKeyMatch && resourceKeyMatch[1]) {
          baseUrl += `&resourcekey=${resourceKeyMatch[1]}`;
        }
        
        return baseUrl;
      }
    }
    
    return cleanUrl;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Playback failed:", e);
            setError("Playback failed. This usually happens if the Google Drive link is restricted or requires login.");
            setIsPlaying(false);
          });
        }

        if (!hasIncremented && track.id) {
          const trackRef = doc(firestore, "tracks", track.id);
          incrementPlayCountNonBlocking(trackRef);
          setHasIncremented(true);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setError(null);
    }
  };

  const handleAudioError = () => {
    if (audioRef.current?.src) {
      setError("The audio source is not accessible via a custom player. Try checking 'Anyone with the link' settings.");
      setIsPlaying(false);
    }
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val[0];
      setCurrentTime(val[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 music-glass rounded-2xl shadow-2xl space-y-6">
      <audio
        ref={audioRef}
        src={getCleanAudioUrl(track.audioUrl)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleAudioError}
        key={track.audioUrl}
        preload="auto"
        crossOrigin="anonymous"
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start max-w-xs overflow-hidden">
          <h3 className="text-xl font-headline font-bold text-primary truncate w-full uppercase tracking-tight">{track.title}</h3>
          <p className="text-muted-foreground uppercase text-sm tracking-widest truncate w-full">{track.artistName}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newLoop = !isLooping;
              setIsLooping(newLoop);
              if (audioRef.current) audioRef.current.loop = newLoop;
            }}
            className={cn("rounded-full", isLooping && "text-accent bg-accent/10")}
          >
            <Repeat className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            className={cn(
              "h-14 w-14 rounded-full text-white retro-shadow transition-transform active:scale-95",
              error ? "bg-muted cursor-not-allowed" : "bg-primary hover:bg-primary/90"
            )}
          >
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
          </Button>
          <div className="flex items-center gap-2 group w-32 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newMute = !isMuted;
                setIsMuted(newMute);
                if (audioRef.current) audioRef.current.muted = newMute;
              }}
              className="rounded-full shrink-0"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(v) => {
                setVolume(v[0]);
                if (audioRef.current) {
                  audioRef.current.volume = v[0] / 100;
                  if (v[0] > 0) {
                    setIsMuted(false);
                    audioRef.current.muted = false;
                  }
                }
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-1">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono">
            LIVE STATS
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono uppercase">
            <BarChart3 className="h-3 w-3" />
            {track.playCount || 0} PLAYS
          </div>
        </div>
      </div>

      {error && (
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="sm" onClick={() => {
              setError(null);
              audioRef.current?.load();
            }} className="h-8 gap-2 border border-destructive/20 hover:bg-destructive/10">
              <RefreshCcw className="h-3 w-3" /> Retry
            </Button>
            {track.audioUrl.includes("drive.google.com") && (
              <Button asChild variant="link" size="sm" className="h-8 text-destructive underline decoration-dotted">
                <a href={track.audioUrl} target="_blank" rel="noopener noreferrer">
                  Open Direct in Drive
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
