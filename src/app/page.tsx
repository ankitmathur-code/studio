
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareButton } from "@/components/ShareButton";
import { VideoEmbed } from "@/components/VideoEmbed";
import { LyricsSection } from "@/components/LyricsSection";
import { Toaster } from "@/components/ui/toaster";
import { Disc3, Music2, TrendingUp, Loader2, Plus, Settings2, Save, Info } from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase, useAuth, useUser, errorEmitter, FirestorePermissionError, initiateAnonymousSignIn } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Automatically sign in anonymously
  useEffect(() => {
    if (!user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, auth]);

  // 1. Get global settings
  const settingsRef = useMemoFirebase(() => doc(firestore, "appSettings", "global"), [firestore]);
  const { data: settings, isLoading: loadingSettings } = useDoc(settingsRef);

  // 2. Get the actual track data
  const trackRef = useMemoFirebase(
    () => (settings?.featuredTrackId ? doc(firestore, "tracks", settings.featuredTrackId) : null),
    [firestore, settings?.featuredTrackId]
  );
  const { data: track, isLoading: loadingTrack } = useDoc(trackRef);

  // Form State
  const [editForm, setEditForm] = useState({
    title: "",
    artistName: "",
    audioUrl: "",
    videoUrl: "",
    lyricsOrNotes: ""
  });

  const openEditDialog = () => {
    if (track) {
      setEditForm({
        title: track.title,
        artistName: track.artistName,
        audioUrl: track.audioUrl,
        videoUrl: track.videoUrl || "",
        lyricsOrNotes: track.lyricsOrNotes || ""
      });
    }
    setIsAdminOpen(true);
  };

  const handleSave = () => {
    if (trackRef) {
      let cleanedUrl = editForm.audioUrl.trim();
      
      // Case-insensitive check for /public/
      if (cleanedUrl.toLowerCase().startsWith("/public/")) {
        cleanedUrl = cleanedUrl.substring(7);
      } else if (cleanedUrl.toLowerCase().startsWith("public/")) {
        cleanedUrl = "/" + cleanedUrl.substring(7);
      }

      // Final cleanup: ensure it starts with / and remove any double slashes
      if (!cleanedUrl.startsWith("http")) {
        if (!cleanedUrl.startsWith("/")) cleanedUrl = "/" + cleanedUrl;
        cleanedUrl = cleanedUrl.replace(/\/+/g, '/');
      }

      const finalData = { ...editForm, audioUrl: cleanedUrl };

      updateDocumentNonBlocking(trackRef, finalData);
      toast({
        title: "Spotlight Updated",
        description: `Now pointing to: ${cleanedUrl}`,
      });
      setIsAdminOpen(false);
    }
  };

  const initializeData = () => {
    const trackId = "neon-dreams-001";
    const trackData = {
      id: trackId,
      title: "Neon Dreams",
      artistName: "The Synth Wave",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      lyricsOrNotes: "In the neon dreams, where the rhythm flows...",
      creationDate: new Date().toISOString()
    };

    const newTrackRef = doc(firestore, "tracks", trackId);
    const newSettingsRef = doc(firestore, "appSettings", "global");

    setDoc(newTrackRef, trackData).catch(e => console.error(e));
    setDoc(newSettingsRef, { id: "global", featuredTrackId: trackId }).catch(e => console.error(e));
  };

  if (loadingSettings || loadingTrack) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
          <Music2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tight">TuneSpotlight Empty</h1>
        <Button onClick={initializeData} className="retro-shadow">
          <Plus className="mr-2 h-4 w-4" /> Setup Initial Data
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pb-20">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <header className="py-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center retro-shadow">
              <Disc3 className="text-white h-6 w-6 animate-spin-slow" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tighter uppercase">TuneSpotlight</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={openEditDialog} className="text-muted-foreground hover:text-primary gap-2">
              <Settings2 className="h-4 w-4" /> Manage
            </Button>
            <ShareButton />
          </div>
        </header>

        <section className="py-12 md:py-20 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-accent font-mono text-sm tracking-widest uppercase mb-2">
              <TrendingUp className="h-4 w-4" /> Featured Release
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white glow-primary leading-none uppercase">
              {track.title}
            </h1>
            <h2 className="text-2xl md:text-3xl font-headline text-muted-foreground tracking-tight uppercase">
              {track.artistName}
            </h2>
          </div>

          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden retro-shadow border-4 border-primary/20">
             <Image 
                src="https://picsum.photos/seed/music123/800/800" 
                alt="Album Cover" 
                fill 
                className="object-cover"
                data-ai-hint="music cover"
              />
          </div>
        </section>

        <section className="py-12">
          <AudioPlayer track={track} />
        </section>

        {track.videoUrl && (
          <section className="py-12 max-w-5xl mx-auto">
             <VideoEmbed videoUrl={track.videoUrl} />
          </section>
        )}

        <LyricsSection track={track} />
      </div>

      <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
        <DialogContent className="max-w-2xl music-glass border-primary/20 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary uppercase">Spotlight Settings</DialogTitle>
            <DialogDescription>Configure the featured song and audio path.</DialogDescription>
          </DialogHeader>
          
          <Alert className="bg-primary/10 border-primary/30 text-primary-foreground mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle className="font-bold uppercase text-xs">Troubleshooting Guide</AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              1. Create a folder exactly named <code className="bg-black/40 px-1 rounded">public</code> (lowercase).<br/>
              2. Put your MP3 inside it.<br/>
              3. If file is <code className="bg-black/40 px-1 rounded">public/vibes.mp3</code>, the URL below must be <code className="bg-black/40 px-1 rounded">/vibes.mp3</code>.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70">Song Title</Label>
                <Input value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70">Artist</Label>
                <Input value={editForm.artistName} onChange={(e) => setEditForm({...editForm, artistName: e.target.value})} className="bg-black/20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold opacity-70 text-accent">Audio URL (e.g. /Monks_Tempo.mp3)</Label>
              <Input 
                value={editForm.audioUrl} 
                onChange={(e) => setEditForm({...editForm, audioUrl: e.target.value})}
                placeholder="/mysong.mp3"
                className="bg-black/20 border-accent/30" 
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold opacity-70">Video Link (YouTube/Drive)</Label>
              <Input value={editForm.videoUrl} onChange={(e) => setEditForm({...editForm, videoUrl: e.target.value})} className="bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold opacity-70">Lyrics</Label>
              <Textarea value={editForm.lyricsOrNotes} onChange={(e) => setEditForm({...editForm, lyricsOrNotes: e.target.value})} rows={4} className="bg-black/20" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="w-full retro-shadow bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Save Spotlight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </main>
  );
}
