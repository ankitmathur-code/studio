
"use client";

import React from "react";
import { Music, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LyricsSection() {
  return (
    <section className="w-full max-w-4xl mx-auto py-12 px-6 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
      <Tabs defaultValue="lyrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="lyrics" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg gap-2">
            <Music className="h-4 w-4" /> LYRICS
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg gap-2">
            <FileText className="h-4 w-4" /> LINER NOTES
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lyrics" className="mt-8 p-8 music-glass rounded-2xl">
          <div className="space-y-6 text-center text-lg leading-relaxed font-body">
            <p className="text-primary italic font-headline">Chorus:</p>
            <p>
              In the neon dreams, where the rhythm flows,<br />
              Cyber pulse in the veins, everybody knows.<br />
              Magenta skies above, purple haze in the street,<br />
              Retro boom bap sound, feel the heart of the beat.
            </p>
            <p className="text-primary italic font-headline">Verse 1:</p>
            <p>
              Walking through the grid, shadows long and wide,<br />
              Nothing but the static on the other side.<br />
              Old school SP, crunching on the sound,<br />
              Lost within the circuitry, never to be found.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-8 p-8 music-glass rounded-2xl">
          <div className="space-y-6">
            <h4 className="text-2xl font-headline text-primary">PRODUCTION CREDITS</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white font-semibold">Produced by:</p>
                <p>Digital Soul (The Synth Wave)</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white font-semibold">Mixed/Mastered:</p>
                <p>Boom Bap Studios, NYC</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white font-semibold">Gear Used:</p>
                <p>SP-1200, Juno-106, Reel-to-Reel Tape</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white font-semibold">Visuals:</p>
                <p>RetroTech Collective</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              "Neon Dreams" is a love letter to the era of hardware samplers and analog warmth. 
              We wanted to capture the grit of late-80s boom bap and fuse it with the expansive 
              textures of modern synthwave. Every drum hit was ran through a vintage 12-bit sampler 
              to get that authentic crunch.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
