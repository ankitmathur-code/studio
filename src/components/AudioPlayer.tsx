
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Repeat, Volume2, VolumeX, SkipBack, SkipForward, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  track: {
    title: string;
    artistName: string;
    audioUrl: string;
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Handle Google Drive links and local paths
  const getCleanAudioUrl = (url: string) => {
    if (!url) return "";
    
    // Clean up local paths
    let cleanUrl = url.trim();
    if (cleanUrl.toLowerCase().startsWith("/public/")) {
      cleanUrl = cleanUrl.substring(7);
    }

    // Handle Google Drive links
    if (cleanUrl.includes("drive.google.com")) {
      // Try to extract ID and convert to direct download stream
      const match = cleanUrl.match(/\/d\/(.+?)\//) || cleanUrl.match(/id=(.+?)(&|$)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=open&id=${match[1]}`;
      }
    }
    
    return cleanUrl;
  };

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [track.audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          console.error("Playback failed:", e);
          setError("Playback failed. If using Google Drive, ensure link is set to 'Anyone with the link' and isn't a restricted file.");
          setIsPlaying(false);
        });
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
    setError("Audio could not be loaded. Check the URL or file permissions.");
    setIsPlaying(false);
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val[0];
      setCurrentTime(val[0]);
    }
  };

  const formatTime = (time: number) => {
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
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start max-w-xs">
          <h3 className="text-xl font-headline font-bold text-primary truncate w-full uppercase tracking-tight">{track.title}</h3>
          <p className="text-muted-foreground uppercase text-sm tracking-widest truncate w-full">{track.artistName}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsLooping(!isLooping);
              if (audioRef.current) audioRef.current.loop = !isLooping;
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
              onClick={() => setIsMuted(!isMuted)}
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
                if (audioRef.current) audioRef.current.volume = v[0] / 100;
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="hidden md:block">
           <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono">
            V1.0.0 ENGINE
          </Badge>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-2 text-destructive text-sm font-mono bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => audioRef.current?.load()} className="h-8 gap-2">
            <RefreshCcw className="h-3 w-3" /> Retry
          </Button>
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
