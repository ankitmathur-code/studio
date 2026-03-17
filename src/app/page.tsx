
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareButton } from "@/components/ShareButton";
import { VideoEmbed } from "@/components/VideoEmbed";
import { LyricsSection } from "@/components/LyricsSection";
import { Toaster } from "@/components/ui/toaster";
import { 
  Disc3, 
  Music2, 
  TrendingUp, 
  Loader2, 
  Plus, 
  Settings2, 
  Save, 
  Image as ImageIcon, 
  LayoutGrid, 
  Sparkles, 
  Trophy, 
  Trash2, 
  Zap,
  Upload,
  CheckCircle2
} from "lucide-react";
import { 
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  useAuth, 
  useUser, 
  initiateAnonymousSignIn, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { uploadFileAction } from "@/app/actions/upload-action";

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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

  // Calculate Top Track
  const topTrackId = React.useMemo(() => {
    if (!allTracks || allTracks.length === 0) return null;
    return allTracks.reduce((prev, current) => 
      (current.playCount || 0) > (prev.playCount || 0) ? current : prev
    ).id;
  }, [allTracks]);

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

  const handleDeleteActiveTrack = () => {
    if (activeTrackRef) {
      deleteDocumentNonBlocking(activeTrackRef);
      toast({ title: "Track Purged", description: "The slop has been removed from the gallery." });
      setActiveTrackId(null);
      setIsAdminOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(10);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(40);
      const result = await uploadFileAction(formData);
      
      if (result.success && result.url) {
        setUploadProgress(100);
        setForm((prev) => ({ ...prev, audioUrl: result.url! }));
        toast({ 
          title: "Upload Complete", 
          description: "File saved to your public/uploads directory." 
        });
        setTimeout(() => setUploadProgress(null), 1000);
      } else {
        throw new Error(result.error || "Failed to save file");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: error.message 
      });
      setUploadProgress(null);
    }
  };

  const handleSubmitNew = () => {
    if (!form.title || !form.artistName || !form.audioUrl) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide a title, artist, and audio link/file." });
      return;
    }

    const tracksRef = collection(firestore, "tracks");
    const newTrackRef = doc(tracksRef);
    
    const newTrack = {
      ...form,
      id: newTrackRef.id,
      playCount: 0,
      creationDate: new Date().toISOString()
    };

    setDocumentNonBlocking(newTrackRef, newTrack, { merge: false });
    
    toast({ title: "Slop Submitted!", description: "Your track has been added to the gallery." });
    setIsSubmitOpen(false);
    setForm({ title: "", artistName: "", audioUrl: "", imageUrl: "", videoUrl: "", lyricsOrNotes: "", linerNotes: "" });
  };

  const initializeData = () => {
    const trackId = "monks-15-mins";
    const trackData = {
      id: trackId,
      title: "15 Mins Of Now",
      artistName: "Ankit Mathur | The Monks AI Slop",
      audioUrl: "https://drive.google.com/uc?id=1O-FEBu4tJ86qc-217dssVADOP2oas8FV&export=download",
      imageUrl: "https://picsum.photos/seed/monks/800/800",
      videoUrl: "",
      lyricsOrNotes: "Testing if it blends with the other slops...",
      linerNotes: "This slop is testing if it blends with the other slops. The clock is always ticking in the world of AI creation.",
      playCount: 420,
      creationDate: new Date().toISOString()
    };

    const newTrackRef = doc(firestore, "tracks", trackId);
    const newSettingsRef = doc(firestore, "appSettings", "global");

    setDocumentNonBlocking(newTrackRef, trackData, { merge: true });
    setDocumentNonBlocking(newSettingsRef, { id: "global", featuredTrackId: trackId }, { merge: true });
    
    toast({ title: "Initializing Chart Topper", description: "15 Mins Of Now set to 420 plays!" });
    setActiveTrackId(trackId);
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
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-accent font-mono text-sm tracking-widest uppercase">
                    <Sparkles className="h-4 w-4" /> Currently Vibing
                  </div>
                  {activeTrack.id === topTrackId && (
                    <Badge className="bg-yellow-500 text-black font-bold uppercase tracking-tighter flex items-center gap-1.5 animate-pulse rounded-full px-4 py-1">
                      <Trophy className="h-4 w-4" /> Slop of the Charts
                    </Badge>
                  )}
                </div>
                <h1 className="text-5xl md:text-8xl font-headline font-bold text-white glow-primary leading-none uppercase">
                  {activeTrack.title}
                </h1>
                <h2 className="text-xl md:text-2xl font-headline text-muted-foreground tracking-tight uppercase">
                  {activeTrack.artistName}
                </h2>
              </div>

              <div className={cn(
                "relative w-full max-sm aspect-square rounded-3xl overflow-hidden border-4 transition-all duration-500 max-w-sm",
                activeTrack.id === topTrackId ? "retro-shadow border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.3)]" : "retro-shadow border-primary/20"
              )}>
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

        {/* The Slop Manifesto */}
        <section className="py-16 px-6 bg-primary/5 rounded-3xl border border-primary/20 music-glass my-12 text-center space-y-8">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center retro-shadow">
                <Trophy className="h-8 w-8 text-white" />
             </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold uppercase tracking-tighter">The Quest for the Top Slop</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Welcome to <span className="text-primary font-bold">AISlopHits</span>, the premier destination for AI-generated auditory experiments. 
              Whether it's a neon-soaked synthwave dream or a glitchy experimental artifact, we celebrate the artifacts that define the future of music.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
            <div className="space-y-3 p-6 rounded-2xl hover:bg-white/5 transition-colors">
              <Zap className="h-6 w-6 text-accent mx-auto" />
              <h3 className="font-bold text-accent uppercase tracking-tight">1. Create</h3>
              <p className="text-sm text-muted-foreground">Fire up your favorite AI model and generate something truly unique.</p>
            </div>
            <div className="space-y-3 p-6 rounded-2xl hover:bg-white/5 transition-colors">
              <Plus className="h-6 w-6 text-accent mx-auto" />
              <h3 className="font-bold text-accent uppercase tracking-tight">2. Submit</h3>
              <p className="text-sm text-muted-foreground">Share your track link (YouTube, Drive, or MP3) with the community.</p>
            </div>
            <div className="space-y-3 p-6 rounded-2xl hover:bg-white/5 transition-colors">
              <TrendingUp className="h-6 w-6 text-accent mx-auto" />
              <h3 className="font-bold text-accent uppercase tracking-tight">3. Conquer</h3>
              <p className="text-sm text-muted-foreground">The track with the most plays takes the throne. Can you beat the current champ?</p>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={() => setIsSubmitOpen(true)} className="bg-accent hover:bg-accent/90 retro-shadow rounded-full px-10 py-7 text-lg font-bold uppercase">
              <Plus className="mr-2 h-5 w-5" /> Join the Slop Mine
            </Button>
          </div>
        </section>

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
                className={cn(
                  "group cursor-pointer space-y-3 p-3 rounded-2xl transition-all hover:bg-white/5 border border-transparent",
                  activeTrackId === t.id && 'border-primary/50 bg-primary/5',
                  t.id === topTrackId && 'ring-2 ring-yellow-500/20'
                )}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden retro-shadow">
                  <Image src={t.imageUrl || "https://picsum.photos/seed/music123/800/800"} alt={t.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  
                  {t.id === topTrackId && (
                    <div className="absolute top-2 right-2 z-20">
                      <Badge className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        TOP SLOP
                      </Badge>
                    </div>
                  )}

                  {activeTrackId === t.id && (
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                      <TrendingUp className="text-white h-8 w-8 animate-bounce" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {t.title}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate uppercase flex justify-between gap-2">
                    <span className="truncate">{t.artistName}</span>
                    <span className="font-mono text-[10px] opacity-60 shrink-0">{t.playCount || 0} PLAYS</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Admin/Submit Modal */}
      <Dialog open={isAdminOpen || isSubmitOpen} onOpenChange={(val) => { if(!val) { setIsAdminOpen(false); setIsSubmitOpen(false); setUploadProgress(null); } }}>
        <DialogContent className="max-w-2xl music-glass border-primary/20 text-foreground overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary uppercase">
              {isAdminOpen ? "Manage Spotlight" : "Submit Your Slop"}
            </DialogTitle>
            <DialogDescription>
              {isAdminOpen ? "Edit or purge the current track." : "Share your AI creation with the world."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70">Song Title</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-black/20" placeholder="Neon Dreams" />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70">Artist</Label>
                <Input value={form.artistName} onChange={(e) => setForm({...form, artistName: e.target.value})} className="bg-black/20" placeholder="AI Wizard" />
              </div>
            </div>
            
            <div className="space-y-4 p-4 border border-white/10 rounded-xl bg-white/5">
              <Label className="uppercase text-xs font-bold opacity-70 flex items-center gap-2">
                <Upload className="h-3 w-3" /> Upload Audio File (to local public/uploads)
              </Label>
              <div className="flex items-center gap-4">
                <Input type="file" accept="audio/*" onChange={handleFileUpload} className="bg-black/20 border-accent/30 flex-1" />
                {form.audioUrl && !uploadProgress && (
                   <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                )}
              </div>
              {uploadProgress !== null && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-[10px] font-mono uppercase text-muted-foreground text-center">Processing: {Math.round(uploadProgress)}%</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold opacity-70 text-accent flex items-center gap-2">
                  <Music2 className="h-3 w-3" /> Audio URL (Fallback)
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isAdminOpen && (
              <Button variant="destructive" onClick={handleDeleteActiveTrack} className="retro-shadow flex-1">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Track
              </Button>
            )}
            <Button onClick={isAdminOpen ? handleUpdateFeatured : handleSubmitNew} disabled={uploadProgress !== null} className="retro-shadow bg-primary hover:bg-primary/90 flex-[2]">
              <Save className="mr-2 h-4 w-4" /> {isAdminOpen ? "Save Changes" : "Submit to Gallery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </main>
  );
}
