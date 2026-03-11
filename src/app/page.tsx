
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareButton } from "@/components/ShareButton";
import { VideoEmbed } from "@/components/VideoEmbed";
import { LyricsSection } from "@/components/LyricsSection";
import { Toaster } from "@/components/ui/toaster";
import { Disc3, Music2, TrendingUp, Loader2, Plus, Settings2, Save, Info, Image as ImageIcon, LayoutGrid, Sparkles } from "lucide-react";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useAuth, useUser, initiateAnonymousSignIn, setDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Featured Track Logic
  const settingsRef = useMemoFirebase(() => doc(firestore, "appSettings", "global"), [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.featuredTrackId && !activeTrackId) {
      setActiveTrackId(settings.featuredTrackId);
    }
  }, [settings?.featuredTrackId, activeTrackId]);

  const activeTrackRef = useMemoFirebase(
    () => (activeTrackId ? doc(firestore, "tracks", activeTrackId) : null),
    [firestore, activeTrackId]
  );
  const { data: activeTrack, isLoading: loadingTrack } = useDoc(activeTrackRef);

  // All Tracks Collection
  const tracksQuery = useMemoFirebase(() => query(collection(firestore, "tracks"), orderBy("creationDate", "desc")), [firestore]);
  const { data: allTracks, isLoading: loadingAll } = useCollection(tracksQuery);

  const [form, setForm] = useState({
    title: "",
    artistName: "",
    audioUrl: "",
    imageUrl: "",
    videoUrl: "",
    lyricsOrNotes: "",
    linerNotes: ""
  });

  const openEditDialog = () => {
    if (activeTrack) {
      setForm({
        title: activeTrack.title || "",
        artistName: activeTrack.artistName || "",
        audioUrl: activeTrack.audioUrl || "",
        imageUrl: activeTrack.imageUrl || "",
        videoUrl: activeTrack.videoUrl || "",
        lyricsOrNotes: activeTrack.lyricsOrNotes || "",
        linerNotes: activeTrack.linerNotes || ""
      });
    }
    setIsAdminOpen(true);
  };

  const handleUpdateFeatured = () => {
    if (activeTrackRef) {
      updateDocumentNonBlocking(activeTrackRef, form);
      toast({ title: "Track Updated", description: "Changes saved successfully." });
      setIsAdminOpen(false);
    }
  };

  const handleSubmitNew = () => {
    if (!form.title || !form.artistName || !form.audioUrl) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide a title, artist, and audio link." });
      return;
    }

    const newTrack = {
      ...form,
      creationDate: new Date().toISOString()
    };

    const tracksRef = collection(firestore, "tracks");
    addDocumentNonBlocking(tracksRef, newTrack);
    
    toast({ title: "Slop Submitted!", description: "Your track has been added to the gallery." });
    setIsSubmitOpen(false);
    setForm({ title: "", artistName: "", audioUrl: "", imageUrl: "", videoUrl: "", lyricsOrNotes: "", linerNotes: "" });
  };

  const initializeData = () => {
    const trackId = "neon-dreams-001";
    const trackData = {
      id: trackId,
      title: "Neon Dreams",
      artistName: "The Synth Wave",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      imageUrl: "https://picsum.photos/seed/music123/800/800",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      lyricsOrNotes: "In the neon dreams, where the rhythm flows...",
      linerNotes: "Recorded in a small basement studio.",
      creationDate: new Date().toISOString()
    };

    const newTrackRef = doc(firestore, "tracks", trackId);
    const newSettingsRef = doc(firestore, "appSettings", "global");

    setDocumentNonBlocking(newTrackRef, trackData, { merge: true });
    setDocumentNonBlocking(newSettingsRef, { id: "global", featuredTrackId: trackId }, { merge: true });
    
    toast({ title: "Initializing...", description: "Setting up the first vibe." });
  };

  if (isUserLoading || (loadingAll && !allTracks)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!allTracks || allTracks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
          <Music2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tight">No Slop Found</h1>
        <p className="text-muted-foreground max-w-xs">Be the first to upload an AI masterpiece.</p>
        <Button onClick={initializeData} className="retro-shadow">
          <Plus className="mr-2 h-4 w-4" /> Seed Sample Data
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pb-20">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <header className="py-8 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTrackId(settings?.featuredTrackId || allTracks[0].id)}>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center retro-shadow">
              <Disc3 className="text-white h-6 w-6 animate-spin-slow" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tighter uppercase">AISlopHits</span>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => {
              setForm({ title: "", artistName: "", audioUrl: "", imageUrl: "", videoUrl: "", lyricsOrNotes: "", linerNotes: "" });
              setIsSubmitOpen(true);
            }} className="border-accent text-accent hover:bg-accent/10 rounded-full">
              <Plus className="h-4 w-4 mr-1" /> Submit Track
            </Button>
            <Button variant="ghost" onClick={openEditDialog} className="text-muted-foreground hover:text-primary gap-2 hidden sm:flex">
              <Settings2 className="h-4 w-4" /> Manage
            </Button>
            <ShareButton />
          </div>
        </header>

        {activeTrack && (
          <>
            <section className="py-12 md:py-20 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-accent font-mono text-sm tracking-widest uppercase mb-2">
                  <Sparkles className="h-4 w-4" /> Currently Vibing
                </div>
                <h1 className="text-5xl md:text-8xl font-headline font-bold text-white glow-primary leading-none uppercase">
                  {activeTrack.title}
                </h1>
                <h2 className="text-xl md:text-2xl font-headline text-muted-foreground tracking-tight uppercase">
                  {activeTrack.artistName}
                </h2>
              </div>

              <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden retro-shadow border-4 border-primary/20">
                 <Image 
                    src={activeTrack.imageUrl || "https://picsum.photos/seed/music123/800/800"} 
                    alt="Album Cover" 
                    fill 
                    className="object-cover"
                  />
              </div>
            </section>

            <section className="py-12">
              <AudioPlayer track={activeTrack} />
            </section>

            {activeTrack.videoUrl && (
              <section className="py-12 max-w-4xl mx-auto">
                 <VideoEmbed videoUrl={activeTrack.videoUrl} />
              </section>
            )}

            <LyricsSection track={activeTrack} />
          </>
        )}

        <Separator className="my-12 bg-white/5" />

        <section className="py-12 space-y-8">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-primary h-6 w-6" />
            <h3 className="text-3xl font-headline font-bold uppercase">Browse the Slop</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allTracks.map((t) => (
              <div 
                key={t.id} 
                onClick={() => {
                  setActiveTrackId(t.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group cursor-pointer space-y-3 p-3 rounded-2xl transition-all hover:bg-white/5 border border-transparent ${activeTrackId === t.id ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden retro-shadow">
                  <Image src={t.imageUrl || "https://picsum.photos/seed/music123/800/800"} alt={t.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  {activeTrackId === t.id && (
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                      <TrendingUp className="text-white h-8 w-8 animate-bounce" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold truncate group-hover:text-primary transition-colors">{t.title}</h4>
                  <p className="text-sm text-muted-foreground truncate uppercase">{t.artistName}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Admin/Submit Modal */}
      <Dialog open={isAdminOpen || isSubmitOpen} onOpenChange={(val) => { setIsAdminOpen(false); setIsSubmitOpen(false); }}>
        <DialogContent className="max-w-2xl music-glass border-primary/20 text-foreground overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary uppercase">
              {isAdminOpen ? "Manage Spotlight" : "Submit Your Slop"}
            </DialogTitle>
            <DialogDescription>
              {isAdminOpen ? "Edit the current track details." : "Share your AI creation with the world."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70">Song Title</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-black/20" placeholder="Neon Dreams" />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70">Artist</Label>
                <Input value={form.artistName} onChange={(e) => setForm({...form, artistName: e.target.value})} className="bg-black/20" placeholder="AI Wizard" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70 text-accent flex items-center gap-2">
                  <Music2 className="h-3 w-3" /> Audio URL
                </Label>
                <Input value={form.audioUrl} onChange={(e) => setForm({...form, audioUrl: e.target.value})} placeholder="Direct link or Drive link" className="bg-black/20 border-accent/30" />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70 flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" /> Image URL
                </Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="bg-black/20" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold opacity-70">Video Link (YouTube/Drive)</Label>
              <Input value={form.videoUrl} onChange={(e) => setForm({...form, videoUrl: e.target.value})} className="bg-black/20" placeholder="https://youtube.com/..." />
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold opacity-70">Liner Notes</Label>
              <Textarea value={form.linerNotes} onChange={(e) => setForm({...form, linerNotes: e.target.value})} rows={3} className="bg-black/20" placeholder="The story behind this slop..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={isAdminOpen ? handleUpdateFeatured : handleSubmitNew} className="w-full retro-shadow bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> {isAdminOpen ? "Save Changes" : "Submit to Gallery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </main>
  );
}
