
"use client";

import React from "react";
import Image from "next/image";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareButton } from "@/components/ShareButton";
import { VideoEmbed } from "@/components/VideoEmbed";
import { LyricsSection } from "@/components/LyricsSection";
import { Toaster } from "@/components/ui/toaster";
import { Disc3, Music2, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden pb-20">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header/Nav */}
        <header className="py-8 flex justify-between items-center animate-fade-in opacity-0">
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center retro-shadow group-hover:rotate-12 transition-transform">
              <Disc3 className="text-white h-6 w-6 animate-spin-slow" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tighter">TUNESPOTLIGHT</span>
          </div>
          <ShareButton />
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-center gap-2 text-accent font-mono text-sm tracking-widest uppercase mb-2">
              <TrendingUp className="h-4 w-4" />
              New Release out now
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white glow-primary leading-none">
              NEON <span className="text-primary italic">DREAMS</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-headline text-muted-foreground tracking-tight">
              THE SYNTH WAVE
            </h2>
          </div>

          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden retro-shadow border-4 border-primary/20 animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
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

        {/* Audio Player Section */}
        <section className="py-12 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
          <AudioPlayer />
        </section>

        {/* Video Section */}
        <section className="py-12 space-y-12">
           <div className="text-center space-y-4">
            <h3 className="text-3xl font-headline font-bold flex items-center justify-center gap-3">
              <Music2 className="text-primary h-8 w-8" />
              OFFICIAL MUSIC VIDEO
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Dive into the neon-soaked world of The Synth Wave. Experience the vision behind the pulse.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <VideoEmbed />
          </div>
        </section>

        {/* Lyrics & Credits */}
        <LyricsSection />

        {/* Footer */}
        <footer className="mt-20 py-12 border-t border-white/5 text-center text-muted-foreground">
          <p className="font-headline text-sm tracking-widest uppercase">
            © {new Date().getFullYear()} TuneSpotlight & The Synth Wave
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Spotify</a>
            <a href="#" className="hover:text-primary transition-colors">Apple Music</a>
            <a href="#" className="hover:text-primary transition-colors">Bandcamp</a>
          </div>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}
