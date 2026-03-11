
"use client";

import React from "react";

export function VideoEmbed() {
  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden music-glass border-primary/20 shadow-2xl group animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
      <iframe
        className="absolute inset-0 w-full h-full"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0&modestbranding=1"
        title="Music Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-3xl group-hover:border-primary/40 transition-colors"></div>
    </div>
  );
}
