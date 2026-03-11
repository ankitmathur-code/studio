
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareButton } from "@/components/ShareButton";
import { VideoEmbed } from "@/components/VideoEmbed";
import { LyricsSection } from "@/components/LyricsSection";
import { Toaster } from "@/components/ui/toaster";
import { Disc3, Music2, TrendingUp, Loader2, Plus, Settings2, Save } from "lucide-react";
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
import { updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Automatically sign in anonymously so the user has "permissions" to save
  useEffect(() => {
    if (!user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, auth]);

  // 1. Get global settings to find the featured track ID
  const settingsRef = useMemoFirebase(() => doc(firestore, "appSettings", "global"), [firestore]);
  const { data: settings, isLoading: loadingSettings } = useDoc(settingsRef);

  // 2. Get the actual track data
  const trackRef = useMemoFirebase(
    () => (settings?.featuredTrackId ? doc(firestore, "tracks", settings.featuredTrackId) : null),
    [firestore, settings?.featuredTrackId]
  );
  const { data: track, isLoading: loadingTrack } = useDoc(trackRef);

  // Form State for editing
  const [editForm, setEditForm] = useState({
    title: "",
    artistName: "",
    audioUrl: "",
    videoUrl: "",
    lyricsOrNotes: ""
  });

  // Initialize form when track loads or dialog opens
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
      updateDocumentNonBlocking(trackRef, editForm);
      toast({
        title: "Track Updated",
        description: "The spotlight has been updated with your new details.",
      });
      setIsAdminOpen(false);
    }
  };

  // Helper to initialize sample data if database is empty
  const initializeData = () => {
    const trackId = "neon-dreams-001";
    const trackData = {
      id: trackId,
      title: "Neon Dreams",
      artistName: "The Synth Wave",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      videoUrl: "https://drive.google.com/file/d/1pc_I370ceAIwaGUfEuXp9lLtPzR_GSnV/view",
      lyricsOrNotes: "In the neon dreams, where the rhythm flows...\nVerse 1: Walking through the grid...",
      creationDate: new Date().toISOString()
    };

    const newTrackRef = doc(firestore, "tracks", trackId);
    const newSettingsRef = doc(firestore, "appSettings", "global");

    // We initiate the writes. If they fail due to permissions, the ErrorListener will catch it.
    setDoc(newTrackRef, trackData)
      .then(() => {
        setDoc(newSettingsRef, {
          id: "global",
          featuredTrackId: trackId
        }).catch(async (e) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: newSettingsRef.path,
            operation: 'create',
            requestResourceData: { id: "global", featuredTrackId: trackId }
          }));
        });
      })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: newTrackRef.path,
          operation: 'create',
          requestResourceData: trackData
        }));
      });
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
        <h1 className="text-3xl font-headline font-bold">No Featured Track Set</h1>
        <p className="text-muted-foreground max-w-md">
          The spotlight is empty! Initialize the database with sample data or add a track in Firestore.
        </p>
        <Button onClick={initializeData} className="retro-shadow">
          <Plus className="mr-2 h-4 w-4" /> Initialize Sample Data
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pb-20">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <header className="py-8 flex justify-between items-center">
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center retro-shadow group-hover:rotate-12 transition-transform">
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
              <TrendingUp className="h-4 w-4" />
              Featured Release
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white glow-primary leading-none uppercase">
              {track.title.split(' ')[0]} <span className="text-primary italic">{track.title.split(' ').slice(1).join(' ')}</span>
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
                className="object-cover hover:scale-105 transition-transform duration-700"
                data-ai-hint="music cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          </div>
        </section>

        <section className="py-12">
          <AudioPlayer track={track} />
        </section>

        {track.videoUrl && (
          <section className="py-12 space-y-12">
             <div className="text-center space-y-4">
              <h3 className="text-3xl font-headline font-bold flex items-center justify-center gap-3">
                <Music2 className="text-primary h-8 w-8" />
                OFFICIAL MUSIC VIDEO
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Experience the vision behind the pulse of {track.artistName}.
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <VideoEmbed videoUrl={track.videoUrl} />
            </div>
          </section>
        )}

        <LyricsSection track={track} />

        <footer className="mt-20 py-12 border-t border-white/5 text-center text-muted-foreground">
          <p className="font-headline text-sm tracking-widest uppercase">
            © {new Date().getFullYear()} TuneSpotlight & {track.artistName}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Spotify</a>
            <a href="#" className="hover:text-primary transition-colors">Apple Music</a>
            <a href="#" className="hover:text-primary transition-colors">Bandcamp</a>
          </div>
        </footer>
      </div>

      <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
        <DialogContent className="max-w-2xl music-glass border-primary/20 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary uppercase">Manage Spotlight</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the featured release details. If you uploaded a song to the <strong>public</strong> folder, set the Audio URL to <code>/filename.mp3</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="uppercase tracking-widest text-xs">Song Title</Label>
                <Input 
                  id="title" 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="bg-black/20 border-white/10" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist" className="uppercase tracking-widest text-xs">Artist Name</Label>
                <Input 
                  id="artist" 
                  value={editForm.artistName} 
                  onChange={(e) => setEditForm({...editForm, artistName: e.target.value})}
                  className="bg-black/20 border-white/10" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audio" className="uppercase tracking-widest text-xs">Audio URL (Link to MP3)</Label>
              <Input 
                id="audio" 
                value={editForm.audioUrl} 
                onChange={(e) => setEditForm({...editForm, audioUrl: e.target.value})}
                placeholder="/mysong.mp3 or https://..."
                className="bg-black/20 border-white/10" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video" className="uppercase tracking-widest text-xs">Video Embed URL (Optional)</Label>
              <Input 
                id="video" 
                value={editForm.videoUrl} 
                onChange={(e) => setEditForm({...editForm, videoUrl: e.target.value})}
                className="bg-black/20 border-white/10" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lyrics" className="uppercase tracking-widest text-xs">Lyrics / Notes</Label>
              <Textarea 
                id="lyrics" 
                value={editForm.lyricsOrNotes} 
                onChange={(e) => setEditForm({...editForm, lyricsOrNotes: e.target.value})}
                rows={5}
                className="bg-black/20 border-white/10" 
              />
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
