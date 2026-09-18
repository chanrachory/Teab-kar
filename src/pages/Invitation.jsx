import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { db, doc, onSnapshot, collection } from "../firebase/config";
import InitialOverlay from "../components/Invitation/InitialOverlay";
import HeroSection from "../components/Invitation/HeroSection";
import ProfileSection from "../components/Invitation/ProfileSection";
import TimelineSection from "../components/Invitation/TimelineSection";
import GallerySection from "../components/Invitation/GallerySection";
import LocationSection from "../components/Invitation/LocationSection";
import FooterSection from "../components/Invitation/FooterSection";
import MusicPlayer from "../components/Invitation/MusicPlayer";
import Toast from "../components/Invitation/Toast";

export default function Invitation() {
  const [searchParams] = useSearchParams();
  const [guestName, setGuestName] = useState(null);
  const [guestId, setGuestId] = useState(null);
  const [showMainContent, setShowMainContent] = useState(false);
  const [weddingDetails, setWeddingDetails] = useState(null);
  const [events, setEvents] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const audioRef = useRef(null);

  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Auto-open guest session via URL parameters (?to=Name or ?guest=Name or ?id=Id) or LocalStorage
  useEffect(() => {
    const paramName = searchParams.get("to") || searchParams.get("guest");
    const paramId = searchParams.get("id");

    if (paramName) {
      const decodedName = decodeURIComponent(paramName).trim();
      setGuestName(decodedName);
      if (paramId) setGuestId(paramId);
      setShowMainContent(true);
      localStorage.setItem("guestName", decodedName);
      localStorage.setItem("guestSaved", "true");
      showToast(`សូមស្វាគមន៍ ${decodedName}!`, "success");
    } else {
      const storedName = localStorage.getItem("guestName");
      if (storedName) {
        setGuestName(storedName);
        setShowMainContent(true);
        showToast("សូមស្វាគមន៍វិញ!", "success");
      }
    }
  }, [searchParams]);


  // Listen to wedding/details document in Firestore
  useEffect(() => {
    const docRef = doc(db, "wedding", "details");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWeddingDetails(data);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to events collection in Firestore
  useEffect(() => {
    const eventRef = collection(db, "events");
    const unsubscribe = onSnapshot(eventRef, (snapshot) => {
      let eventList = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      eventList.sort((a, b) => {
        if (typeof a.order === "number" && typeof b.order === "number")
          return a.order - b.order;
        const ta = a.createdAt?.toDate
          ? a.createdAt.toDate().getTime()
          : new Date(a.createdAt || 0).getTime();
        const tb = b.createdAt?.toDate
          ? b.createdAt.toDate().getTime()
          : new Date(b.createdAt || 0).getTime();
        return ta - tb;
      });

      setEvents(eventList);
    });
    return () => unsubscribe();
  }, []);

  const startMusic = () => {
    if (audioRef.current && !isPlayingMusic) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => console.log("Waiting for user interaction to play music"));
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlayingMusic(true);
    } else {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  const handleOverlayComplete = (finalName, qrId) => {
    setGuestName(finalName);
    if (qrId) setGuestId(qrId);
    setShowMainContent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoutGuest = () => {
    localStorage.removeItem("guestName");
    localStorage.removeItem("guestSaved");
    setGuestName(null);
    setGuestId(null);
    setShowMainContent(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Background Music Audio Element */}
      <audio ref={audioRef} loop>
        <source
          src="/music/ALL3RGY Lyrics FT. JENNA NORODOM (LACIMA CARTEL).mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* Floating Music Control */}
      {showMainContent && (
        <MusicPlayer isPlaying={isPlayingMusic} onToggle={toggleMusic} />
      )}

      {/* Initial Overlay Selection */}
      {!showMainContent && (
        <InitialOverlay
          onComplete={handleOverlayComplete}
          showToast={showToast}
          startMusic={startMusic}
        />
      )}

      {/* Main Content */}
      {showMainContent && (
        <main className="fade-in">
          <HeroSection
            weddingDetails={weddingDetails}
            guestName={guestName}
            guestId={guestId}
            onLogoutGuest={handleLogoutGuest}
          />
          <ProfileSection weddingDetails={weddingDetails} />
          <TimelineSection events={events} />
          <GallerySection
            firestoreGallery={weddingDetails?.galleryImages}
            weddingDetails={weddingDetails}
          />
          <LocationSection mapUrl={weddingDetails?.mapUrl} />
          <FooterSection showToast={showToast} />
        </main>
      )}

      {/* Toast Notification */}
      <Toast toasts={toasts} />
    </div>
  );
}
