
"use client";

import React from "react";
import { Music, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LyricsSectionProps {
  track: {
    lyricsOrNotes: string;
  };
}

export function LyricsSection({ track }: LyricsSectionProps) {
  // Simple splitting of lyrics and notes if they are in the same field
  // or just showing the field in both tabs for now.
  const content = track.lyricsOrNotes || "No information provided.";

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
          <div className="space-y-6 text-center text-lg leading-relaxed font-body whitespace-pre-line">
            {content}
          </div>
        </TabsContent>
        <TabsContent value="notes" className="mt-8 p-8 music-glass rounded-2xl">
          <div className="space-y-6">
            <h4 className="text-2xl font-headline text-primary uppercase">Production Details</h4>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {content}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
