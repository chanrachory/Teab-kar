import React from "react";
import { Heart, Sparkles, MailOpen } from "lucide-react";

export default function InitialOverlay({
  onComplete,
  startMusic,
  weddingDetails,
}) {
  const groomName = weddingDetails?.groomName || "កូនកំលោះ";
  const brideName = weddingDetails?.brideName || "កូនក្រមុំ";

  const handleOpenInvitation = () => {
    if (startMusic) startMusic();
    if (onComplete) onComplete("ភ្ញៀវកិត្តិយស", null);
  };

  return (
    <div
      id="initial-overlay"
      className="hero-bg px-4 min-h-screen flex items-center justify-center"
    >
      <div className="max-w-md w-full glass-box p-8 sm:p-12 rounded-[2.5rem] text-center shadow-2xl border-2 border-amber-500/30 backdrop-blur-xl relative overflow-hidden">
        {/* Glowing Heart Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-full border border-rose-500/30 shadow-lg">
            <Heart className="text-rose-500 fill-rose-500 animate-pulse w-10 h-10" />
          </div>
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">
            សិរីមង្គលអាពាហ៍ពិពាហ៍
          </p>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Bride & Groom Names */}
        <h2 className="font-moul text-2xl sm:text-3xl gold-text mb-6 leading-relaxed">
          {groomName} <span className="text-rose-400 font-serif">&amp;</span> {brideName}
        </h2>

        <p className="text-gray-200 text-sm mb-8 leading-relaxed font-light">
          សូមគោរពអញ្ជើញ ភ្ញៀវកិត្តិយសទាំងអស់ ចូលរួមអបអរសាទរពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ
        </p>

        {/* Single Open Invitation Button */}
        <button
          type="button"
          onClick={handleOpenInvitation}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 text-base border border-amber-400/40"
        >
          <MailOpen className="w-5 h-5" />
          បើកធៀបសិរីមង្គល 💌
        </button>
      </div>
    </div>
  );
}
