
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Repeat, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [sessionCount, setSessionCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tuneSpotlightPlays");
    if (stored) setSessionCount(parseInt(stored));
    
    // Reset player when track changes
    setIsPlaying(false);
    setCurrentTime(0);
  }, [track.audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
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
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    sessionStorage.setItem("tuneSpotlightPlays", newCount.toString());
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val[0];
      setCurrentTime(val[0]);
    }
  };

  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
    if (audioRef.current) {
      audioRef.current.volume = val[0] / 100;
    }
    if (val[0] === 0) setIsMuted(true);
    else setIsMuted(false);
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
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        key={track.audioUrl}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-headline font-bold text-primary glow-primary uppercase tracking-tight">{track.title}</h3>
          <p className="text-muted-foreground uppercase text-sm tracking-widest">{track.artistName}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLoop}
            className={cn("rounded-full", isLooping && "text-accent bg-accent/10")}
          >
            <Repeat className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-white retro-shadow transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
            <SkipForward className="h-5 w-5" />
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
              onValueChange={handleVolumeChange}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono">
            {sessionCount} PLAYS THIS SESSION
          </Badge>
        </div>
      </div>

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
