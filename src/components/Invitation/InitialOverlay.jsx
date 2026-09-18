import React, { useState } from "react";
import { Heart, Sparkles, MailOpen, User } from "lucide-react";

export default function InitialOverlay({
  onComplete,
  startMusic,
  weddingDetails,
  initialGuestName = "",
}) {
  const [inputName, setInputName] = useState(initialGuestName || "");
  const groomName = weddingDetails?.groomName || "កូនកំលោះ";
  const brideName = weddingDetails?.brideName || "កូនក្រមុំ";

  const handleOpenInvitation = (e) => {
    if (e) e.preventDefault();
    if (startMusic) startMusic();
    const finalName = inputName.trim() || initialGuestName || "ភ្ញៀវកិត្តិយស";
    if (onComplete) onComplete(finalName, null);
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
        <h2 className="font-moul text-2xl sm:text-3xl gold-text mb-4 leading-relaxed">
          {groomName} <span className="text-rose-400 font-serif">&amp;</span> {brideName}
        </h2>

        <p className="text-gray-200 text-sm mb-4 leading-relaxed font-light">
          សូមគោរពអញ្ជើញ{" "}
          <span className="font-bold gold-text underline decoration-amber-400/50">
            {inputName.trim() || initialGuestName || "ភ្ញៀវកិត្តិយស"}
          </span>{" "}
          ចូលរួមអបអរសាទរពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ
        </p>

        {/* Guest Name Input Form */}
        <form onSubmit={handleOpenInvitation} className="mb-2">
          <div className="relative mb-4">
            <User className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="បញ្ចូលឈ្មោះរបស់អ្នក (ឧ. លោក សុខ)"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400 focus:bg-white/20 transition-all text-center font-semibold"
            />
          </div>

          {/* Single Open Invitation Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 text-base border border-amber-400/40 cursor-pointer"
          >
            <MailOpen className="w-5 h-5" />
            បើកធៀបសិរីមង្គល 💌
          </button>
        </form>
      </div>
    </div>
  );
}
