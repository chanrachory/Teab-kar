import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { getImageUrl } from "../../services/cloudinary";

export default function HeroSection({
  weddingDetails,
  guestName,
  onLogoutGuest,
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const weddingDateStr =
    weddingDetails?.eventDateStr || "2030-02-04T00:00:00";

  useEffect(() => {
    const timer = setInterval(() => {
      const weddingDate = new Date(weddingDateStr).getTime();
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDateStr]);

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

  const currentCover = coverImagesList[currentCoverIdx] || "";
  const heroStyle = currentCover
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${currentCover}')`,
      }
    : {};

  return (
    <section
      className="hero-bg min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 relative"
      style={heroStyle}
    >
      <div className="fade-in w-full max-w-4xl">
        <h1 className="font-moul text-2xl sm:text-4xl md:text-5xl mb-12 tracking-wider">
          សិរីមង្គលអាពាហ៍ពិពាហ៍
        </h1>

        <div className="glass-box rounded-[3rem] py-12 px-6 sm:px-12 mb-12 border-2 border-white/5">
          <h2 className="font-moul text-4xl sm:text-6xl md:text-7xl gold-text mb-6">
            {weddingDetails?.groomName || "កូនកំលោះ"}
          </h2>
          <div className="my-8 flex justify-center">
            <Heart className="fill-red-500 text-red-500 w-16 h-16 animate-pulse" />
          </div>
          <h2 className="font-moul text-4xl sm:text-6xl md:text-7xl gold-text mt-6">
            {weddingDetails?.brideName || "កូនក្រមុំ"}
          </h2>
        </div>

        <p className="text-lg md:text-xl mb-6 italic text-gray-300">
          សូមគោរពអញ្ជើញ
        </p>

        <div className="guest-box mb-12">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-4xl font-bold tracking-widest text-white">
              {guestName || "ភ្ញៀវកិត្តិយស"}
            </span>
            <button
              onClick={onLogoutGuest}
              className="ml-2 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition"
            >
              ប្តូរឈ្មោះ
            </button>
          </div>
        </div>

        <div className="space-y-4 bg-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
          <p className="date_text font-moul sm:text-2xl gold-text">
            {weddingDetails?.eventDate || "ថ្ងៃអាទិត្យ ទី ០៤ ខែ កុម្ភៈ ឆ្នាំ ២០៣០"}
          </p>
          <p className="text-gray-200 text-sm sm:text-lg">
            {weddingDetails?.location || "ភូមិរោងធិ៍រោង ឃុំជីផុច ស្រុកមេសាង ខេត្តព្រៃវែង"}
          </p>

          {/* Countdown Timer */}
          <div className="mt-8 grid grid-cols-4 gap-4 text-amber-500 font-moul">
            <div className="bg-black/60 p-4 rounded-xl border border-amber-500/30">
              <div className="text-2xl sm:text-4xl">{timeLeft.days}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1 font-kantumruy">
                ថ្ងៃ
              </div>
            </div>
            <div className="bg-black/60 p-4 rounded-xl border border-amber-500/30">
              <div className="text-2xl sm:text-4xl">{timeLeft.hours}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1 font-kantumruy">
                ម៉ោង
              </div>
            </div>
            <div className="bg-black/60 p-4 rounded-xl border border-amber-500/30">
              <div className="text-2xl sm:text-4xl">{timeLeft.minutes}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1 font-kantumruy">
                នាទី
              </div>
            </div>
            <div className="bg-black/60 p-4 rounded-xl border border-amber-500/30">
              <div className="text-2xl sm:text-4xl">{timeLeft.seconds}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1 font-kantumruy">
                វិនាទី
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
