import React, { useRef, useState } from "react";
import { Music } from "lucide-react";

export default function MusicPlayer({ isPlaying, onToggle }) {
  return (
    <div
      id="music-control"
      onClick={onToggle}
      className={`${isPlaying ? "music-playing" : ""}`}
      title="បើក/បិទ តន្ត្រី"
    >
      <Music className="text-white w-5 h-5" />
    </div>
  );
}
