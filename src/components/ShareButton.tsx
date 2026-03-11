
"use client";

import React from "react";
import { Share2, Link as LinkIcon, Twitter, Facebook } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ShareButton() {
  const { toast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Share the neon vibes with your crew.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 rounded-full gap-2">
          <Share2 className="h-4 w-4" />
          SHARE TRACK
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="music-glass border-primary/20 text-foreground">
        <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer focus:bg-primary/20">
          <LinkIcon className="h-4 w-4" /> Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/20">
          <Twitter className="h-4 w-4" /> Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/20">
          <Facebook className="h-4 w-4" /> Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
