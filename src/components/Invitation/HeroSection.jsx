import React, { useState, useEffect } from "react";
import { getImageUrl } from "../../services/cloudinary";

export default function HeroSection({
  weddingDetails,
  guestName,
  onLogoutGuest,
  onUpdateGuestName,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputName, setInputName] = useState(guestName || "");

  useEffect(() => {
    setInputName(guestName || "");
  }, [guestName]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (onUpdateGuestName) {
      onUpdateGuestName(inputName);
    }
    setIsEditing(false);
  };

  const resolveUrl = (img) => {
    if (!img) return "";
    if (
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("data:")
    ) {
      return img;
    }
    return getImageUrl(img);
  };

  const rawList =
    Array.isArray(weddingDetails?.coverImages) && weddingDetails.coverImages.length > 0
      ? weddingDetails.coverImages
      : weddingDetails?.coverImageUrl
      ? [weddingDetails.coverImageUrl]
      : weddingDetails?.coverUrl
      ? [weddingDetails.coverUrl]
      : [];

  const coverImagesList = rawList.map(resolveUrl).filter(Boolean);

  const [currentCoverIdx, setCurrentCoverIdx] = useState(0);

  useEffect(() => {
    if (coverImagesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCoverIdx((prev) => (prev + 1) % coverImagesList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [coverImagesList.length]);

  const currentCover =
    coverImagesList[currentCoverIdx] ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000";

  const heroStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%), url('${currentCover}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const groomName = weddingDetails?.groomName || "កូនកំលោះ";
  const brideName = weddingDetails?.brideName || "កូនក្រមុំ";

  return (
    <section
      className="min-h-screen flex flex-col justify-between items-center text-center px-4 py-8 sm:py-12 relative overflow-hidden select-none"
      style={heroStyle}
    >
      {/* TOP HEADER SECTION */}
      <div className="fade-in pt-4 space-y-3 max-w-2xl mx-auto z-10">
        <h1 className="font-moul text-3xl sm:text-5xl md:text-6xl tracking-wide text-[#eab308] drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] leading-relaxed filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          សិរីមង្គលអាពាហ៍ពិពាហ៍
        </h1>
        <p className="font-moul text-2xl sm:text-3xl md:text-4xl text-[#fef08a] drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] tracking-wider">
          <span className="text-[#fde047]">{groomName}</span> <span className="font-serif font-normal text-[#fef08a] text-xl sm:text-2xl">និង</span> <span className="text-[#fde047]">{brideName}</span>
        </p>
      </div>

      {/* MIDDLE INVITATION & GUEST SECTION */}
      <div className="fade-in max-w-xl w-full space-y-6 my-auto py-4 z-10">
        <p className="text-base sm:text-lg md:text-xl text-[#fef08a] font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          សូមគោរពអញ្ជើញ
        </p>

        {/* Golden Pill Container for Guest Name */}
        <div className="relative mx-auto max-w-lg px-2">
          {isEditing ? (
            <form
              onSubmit={handleSaveName}
              className="flex items-center justify-center gap-2 p-2 rounded-full bg-black/80 border-2 border-[#fde047] shadow-2xl"
            >
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
                className="flex-1 px-4 py-2.5 bg-transparent text-white text-center font-bold outline-none text-base sm:text-lg"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#fde047] text-slate-900 font-extrabold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-md cursor-pointer hover:bg-yellow-400 transition"
              >
                រក្សាទុក
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-white/20 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-white/30 transition"
              >
                បោះបង់
              </button>
            </form>
          ) : (
            <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
              {/* Outer Glow & Golden Card Frame */}
              <div className="py-3 px-6 sm:px-10 rounded-full bg-gradient-to-r from-[#fef9c3] via-[#fde047] to-[#eab308] p-[2px] shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full py-2.5 px-6 sm:px-8 rounded-full bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#eab308] border-2 border-[#b45309]/40 flex items-center justify-center shadow-inner">
                  <span className="font-extrabold text-lg sm:text-2xl md:text-3xl text-[#362003] tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                    {guestName || "លោក សុខ តេជៈវិសាល និងភរិយា"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wedding Date & Time Details */}
        <p className="text-sm sm:text-base md:text-lg text-white font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] leading-relaxed px-2">
          {weddingDetails?.eventDate || "ថ្ងៃសៅរ៍ ទី១៦ ខែឧសភា ឆ្នាំ២០២៦ វេលាម៉ោង ៥:០០ ល្ងាច"}
        </p>
      </div>

      {/* BOTTOM SCROLL INDICATOR */}
      <div className="fade-in pb-4 z-10">
        <div className="py-2.5 px-7 rounded-full bg-black/60 border border-white/25 backdrop-blur-md shadow-2xl text-white flex flex-col items-center gap-0.5 animate-bounce">
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm md:text-base">
            <span>↑</span>
            <span>👆</span>
            <span>សូមអូសចុះក្រោម</span>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-300 font-sans tracking-wide">Scroll down</span>
        </div>
      </div>
    </section>
  );
}
