import React, { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import {
  getImageUrl,
  preWeddingImages,
  ceremonyImages,
} from "../../services/cloudinary";

export default function GallerySection({ firestoreGallery, weddingDetails }) {
  const [currentTab, setCurrentTab] = useState("prewedding");
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const preweddingList = weddingDetails?.preweddingImages || [];
  const ceremonyList = weddingDetails?.ceremonyImages || [];

  let images = [];
  if (currentTab === "prewedding") {
    if (preweddingList.length > 0) {
      images = preweddingList.map((img) => ({ url: getImageUrl(img) }));
    } else {
      images = [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
      ].map((url) => ({ url }));
    }
  } else {
    if (ceremonyList.length > 0) {
      images = ceremonyList.map((img) => ({ url: getImageUrl(img) }));
    } else {
      images = [
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
      ].map((url) => ({ url }));
    }
  }

  return (
    <section className="py-24 px-6 bg-black/50 backdrop-blur-md text-white relative border-y border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center px-4 mb-12">
          <h3 className="font-moul sm:text-3xl gold-text underline underline-offset-8 decoration-amber-400/50 leading-loose">
            វិចិត្រសាលរូបភាព
          </h3>
          <p className="text-gray-300 mt-4 font-kantumruy">
            អនុស្សាវរីយ៍ដ៏ស្រស់ស្អាតរបស់យើង
          </p>
        </div>

        {/* Gallery Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setCurrentTab("prewedding")}
            className={`px-6 py-2 rounded-full border border-amber-500 font-kantumruy transition-all duration-300 cursor-pointer ${
              currentTab === "prewedding"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
                : "bg-white/10 text-amber-300 hover:bg-white/20"
            }`}
          >
            Pre-Wedding
          </button>
          <button
            onClick={() => setCurrentTab("ceremony")}
            className={`px-6 py-2 rounded-full border border-amber-500 font-kantumruy transition-all duration-300 cursor-pointer ${
              currentTab === "ceremony"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
                : "bg-white/10 text-amber-300 hover:bg-white/20"
            }`}
          >
            Ceremony
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((item, idx) => {
            const imageUrl = typeof item === "string" ? item : item.url;
            return (
              <div
                key={idx}
                onClick={() => setLightboxSrc(imageUrl)}
                className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-md group cursor-pointer relative"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-10 flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8" />
                </div>
                <img
                  src={imageUrl}
                  alt="Wedding Memory"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 transition-opacity duration-300">
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute right-4 top-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxSrc}
            alt="Enlarged view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-transform duration-300"
          />
        </div>
      )}
    </section>
  );
}
