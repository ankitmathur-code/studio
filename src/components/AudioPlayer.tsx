
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Repeat, Volume2, VolumeX, AlertCircle, RefreshCcw, BarChart3, ExternalLink, MonitorPlay } from "lucide-react";
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
  const [useEmbed, setUseEmbed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firestore = useFirestore();

  // Reset state when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    setHasIncremented(false);
    setUseEmbed(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [track.id, track.audioUrl]);

  const isGoogleDrive = track.audioUrl.includes("drive.google.com");

  const getDriveEmbedUrl = (url: string) => {
    if (!url) return "";
    const idMatch = url.match(/\/d\/([^\/\?#]+)/) || url.match(/[?&]id=([^&#]+)/);
    const resourceKeyMatch = url.match(/[?&]resourcekey=([^&#]+)/);
    
    if (idMatch && idMatch[1]) {
      let baseUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
      if (resourceKeyMatch && resourceKeyMatch[1]) {
        // Ensure the resourcekey is passed to the preview iframe
        baseUrl += `?resourcekey=${resourceKeyMatch[1]}`;
      }
      return baseUrl;
    }
    return url;
  };

  const getCleanAudioUrl = (url: string) => {
    if (!url) return "";
    let cleanUrl = url.trim();
    
    if (cleanUrl.toLowerCase().startsWith("/public/")) {
      return cleanUrl.substring(7);
    }

    if (cleanUrl.includes("drive.google.com")) {
      const idMatch = cleanUrl.match(/\/d\/([^\/\?#]+)/) || cleanUrl.match(/[?&]id=([^&#]+)/);
      const resourceKeyMatch = cleanUrl.match(/[?&]resourcekey=([^&#]+)/);

      if (idMatch && idMatch[1]) {
        // Direct download endpoint with resourcekey support
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
            setError("Playback failed. If using Google Drive, ensure the file is shared with 'Anyone with the link'.");
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
      setError("Audio could not be loaded. Check the URL path or sharing permissions.");
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
      {!useEmbed ? (
        <>
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
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <div className="flex flex-col">
              <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-tight">Drive Embed Player</h3>
              <p className="text-xs text-muted-foreground uppercase">Bypassing browser restrictions</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setUseEmbed(false)} className="text-xs h-8">
              Back to Custom Player
            </Button>
          </div>
          <div className="relative w-full h-[150px] rounded-xl overflow-hidden border border-white/10 bg-black/20">
            <iframe
              src={getDriveEmbedUrl(track.audioUrl)}
              className="absolute inset-0 w-full h-full"
              allow="autoplay"
            ></iframe>
          </div>
        </div>
      )}

      {isGoogleDrive && !useEmbed && (
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20 text-accent text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-4 w-4 shrink-0" />
              <span className="font-mono">Google Drive Link Detected</span>
            </div>
            <Button size="sm" onClick={() => {
              setUseEmbed(true);
              if (!hasIncremented && track.id) {
                const trackRef = doc(firestore, "tracks", track.id);
                incrementPlayCountNonBlocking(trackRef);
                setHasIncremented(true);
              }
            }} className="h-8 gap-2 bg-accent hover:bg-accent/90">
              <MonitorPlay className="h-3 w-3" /> Use Embed Player
            </Button>
          </div>
        </div>
      )}

      {error && !useEmbed && (
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
            <Button asChild variant="link" size="sm" className="h-8 text-destructive underline decoration-dotted">
              <a href={track.audioUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" /> Open Direct
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
