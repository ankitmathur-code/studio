
"use client";

import React from "react";

interface VideoEmbedProps {
  videoUrl: string;
}

export function VideoEmbed({ videoUrl }: VideoEmbedProps) {
  // Simple conversion for shared drive links or normal links
  const embedUrl = videoUrl.includes("view") ? videoUrl.replace("view", "preview") : videoUrl;

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden music-glass border-primary/20 shadow-2xl group animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
      <iframe
        className="absolute inset-0 w-full h-full"
        src={embedUrl}
        title="Music Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-3xl group-hover:border-primary/40 transition-colors"></div>
    </div>
  );
}
