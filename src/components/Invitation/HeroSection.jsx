import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { getImageUrl } from "../../services/cloudinary";

export default function HeroSection({
  weddingDetails,
  guestName,
  onLogoutGuest,
  onUpdateGuestName,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputName, setInputName] = useState(guestName || "");
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

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
        backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url('${currentCover}')`,
      }
    : {};

  return (
    <section
      className="hero-bg min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 relative"
      style={heroStyle}
    >
      <div className="fade-in w-full max-w-4xl">
        <h1 className="font-moul text-2xl sm:text-4xl md:text-5xl mb-12 tracking-wider gold-text">
          សិរីមង្គលអាពាហ៍ពិពាហ៍
        </h1>

        <div className="glass-box rounded-[3rem] py-12 px-6 sm:px-12 mb-12 border-2 border-amber-400/30 shadow-2xl">
          <h2 className="font-moul text-4xl sm:text-6xl md:text-7xl gold-text mb-6">
            {weddingDetails?.groomName || "កូនកំលោះ"}
          </h2>
          <div className="my-8 flex justify-center">
            <Heart className="fill-red-500 text-red-500 w-16 h-16 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
          </div>
          <h2 className="font-moul text-4xl sm:text-6xl md:text-7xl gold-text mt-6">
            {weddingDetails?.brideName || "កូនក្រមុំ"}
          </h2>
        </div>

        <p className="text-lg md:text-xl mb-6 italic text-amber-200/90 font-medium">
          សូមគោរពអញ្ជើញ
        </p>

        <div className="guest-box mb-12 border-amber-400/60 bg-black/25 backdrop-blur-md shadow-xl">
          {isEditing ? (
            <form
              onSubmit={handleSaveName}
              className="flex items-center justify-center gap-2 max-w-sm mx-auto"
            >
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
                className="flex-1 px-4 py-2 bg-white/20 border border-amber-400 rounded-xl text-white text-center font-bold outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl transition text-sm shadow-md"
              >
                រក្សាទុក
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-white/20 hover:bg-white/30 text-gray-200 px-3 py-2 rounded-xl transition text-sm"
              >
                បោះបង់
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-4xl font-bold tracking-widest text-white drop-shadow-md">
                {guestName || "ភ្ញៀវកិត្តិយស"}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 text-sm bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 px-3.5 py-2 rounded-xl transition cursor-pointer font-semibold shadow-sm"
              >
                ប្តូរឈ្មោះ
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 bg-black/30 p-8 rounded-3xl border border-amber-400/30 backdrop-blur-md shadow-2xl">
          <p className="date_text font-moul sm:text-2xl gold-text">
            {weddingDetails?.eventDate || "ថ្ងៃអាទិត្យ ទី ០៤ ខែ កុម្ភៈ ឆ្នាំ ២០៣០"}
          </p>
          <p className="text-gray-100 text-sm sm:text-lg font-medium">
            {weddingDetails?.location || "ភូមិរោងធិ៍រោង ឃុំជីផុច ស្រុកមេសាង ខេត្តព្រៃវែង"}
          </p>

          {/* Countdown Timer */}
          <div className="mt-8 grid grid-cols-4 gap-4 text-amber-400 font-moul">
            <div className="bg-black/35 p-4 rounded-xl border border-amber-400/30 backdrop-blur-sm shadow-md">
              <div className="text-2xl sm:text-4xl text-amber-300">{timeLeft.days}</div>
              <div className="text-xs sm:text-sm text-gray-200 mt-1 font-kantumruy">
                ថ្ងៃ
              </div>
            </div>
            <div className="bg-black/35 p-4 rounded-xl border border-amber-400/30 backdrop-blur-sm shadow-md">
              <div className="text-2xl sm:text-4xl text-amber-300">{timeLeft.hours}</div>
              <div className="text-xs sm:text-sm text-gray-200 mt-1 font-kantumruy">
                ម៉ោង
              </div>
            </div>
            <div className="bg-black/35 p-4 rounded-xl border border-amber-400/30 backdrop-blur-sm shadow-md">
              <div className="text-2xl sm:text-4xl text-amber-300">{timeLeft.minutes}</div>
              <div className="text-xs sm:text-sm text-gray-200 mt-1 font-kantumruy">
                នាទី
              </div>
            </div>
            <div className="bg-black/35 p-4 rounded-xl border border-amber-400/30 backdrop-blur-sm shadow-md">
              <div className="text-2xl sm:text-4xl text-amber-300">{timeLeft.seconds}</div>
              <div className="text-xs sm:text-sm text-gray-200 mt-1 font-kantumruy">
                វិនាទី
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
