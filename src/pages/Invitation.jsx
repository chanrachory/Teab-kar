import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { db, doc, getDoc, onSnapshot, collection } from "../firebase/config";
import { getImageUrl } from "../services/cloudinary";
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

  // Auto-open guest session via URL parameters (?to=Name or ?guest=Name or ?id=Id) or Firestore or LocalStorage
  useEffect(() => {
    const getParam = (keys) => {
      for (const key of keys) {
        for (const [pKey, pVal] of searchParams.entries()) {
          if (pKey.toLowerCase() === key.toLowerCase() && pVal && pVal.trim()) {
            return pVal.trim();
          }
        }
      }
      return null;
    };

    const paramName = getParam(["to", "guest", "name", "n", "guestname", "guest_name"]);
    const paramId = getParam(["id", "guestid", "guest_id"]);

    const loadGuestData = async () => {
      let resolvedName = null;
      let resolvedId = paramId || null;

      // 1. If name is passed directly in URL query parameters
      if (paramName) {
        resolvedName = decodeURIComponent(paramName).trim();
      }

      // 2. If ID is provided, query Firestore rsvps collection to get the Admin-entered guest name
      if (paramId) {
        try {
          const guestDocRef = doc(db, "rsvps", paramId);
          const guestSnap = await getDoc(guestDocRef);
          if (guestSnap.exists()) {
            const data = guestSnap.data();
            const dbName = data.displayName || data.name1 || data.name;
            if (dbName && dbName.trim()) {
              resolvedName = dbName.trim();
            }
          }
        } catch (err) {
          console.error("Error fetching guest details from Firestore:", err);
        }
      }

      // 3. Fallback to LocalStorage if no URL params or Firestore match found
      if (!resolvedName) {
        const storedName = localStorage.getItem("guestName");
        if (storedName && storedName.trim()) {
          resolvedName = storedName.trim();
        }
      }

      if (resolvedName) {
        setGuestName(resolvedName);
        if (resolvedId) setGuestId(resolvedId);
        setShowMainContent(true);
        localStorage.setItem("guestName", resolvedName);
        localStorage.setItem("guestSaved", "true");
        showToast(`សូមស្វាគមន៍ ${resolvedName}!`, "success");
      }
    };

    loadGuestData();
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
    const validName = finalName && finalName.trim() ? finalName.trim() : "ភ្ញៀវកិត្តិយស";
    setGuestName(validName);
    if (qrId) setGuestId(qrId);
    setShowMainContent(true);
    localStorage.setItem("guestName", validName);
    localStorage.setItem("guestSaved", "true");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateGuestName = (newName) => {
    const validName = newName && newName.trim() ? newName.trim() : "ភ្ញៀវកិត្តិយស";
    setGuestName(validName);
    localStorage.setItem("guestName", validName);
    localStorage.setItem("guestSaved", "true");
    showToast(`បានប្តូរឈ្មោះទៅជា "${validName}"`, "success");
  };

  const handleLogoutGuest = () => {
    localStorage.removeItem("guestName");
    localStorage.removeItem("guestSaved");
    setGuestName(null);
    setGuestId(null);
    setShowMainContent(false);
  };

  // Resolve Admin Background Image
  const bgImageUrl = weddingDetails?.bgImageUrl || weddingDetails?.backgroundImageUrl;
  const resolvedBgUrl = bgImageUrl
    ? bgImageUrl.startsWith("http://") ||
      bgImageUrl.startsWith("https://") ||
      bgImageUrl.startsWith("data:") ||
      bgImageUrl.startsWith("blob:")
      ? bgImageUrl
      : getImageUrl(bgImageUrl)
    : null;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* FIXED PARALLAX BACKGROUND IMAGE SET BY ADMIN */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {resolvedBgUrl ? (
          <>
            <img
              src={resolvedBgUrl}
              alt="Wedding Invitation Background"
              className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05] transition-all duration-1000 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-amber-950/20 to-black/60 backdrop-blur-[1px]" />
          </>
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/60 via-amber-950/80 to-slate-950" />
        )}
      </div>

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
        <div className="relative z-10">
          <InitialOverlay
            onComplete={handleOverlayComplete}
            showToast={showToast}
            startMusic={startMusic}
            weddingDetails={weddingDetails}
            initialGuestName={guestName}
          />
        </div>
      )}

      {/* Main Content */}
      {showMainContent && (
        <main className="relative z-10 fade-in">
          <HeroSection
            weddingDetails={weddingDetails}
            guestName={guestName}
            guestId={guestId}
            onLogoutGuest={handleLogoutGuest}
            onUpdateGuestName={handleUpdateGuestName}
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
