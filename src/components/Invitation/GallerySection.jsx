import React, { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import {
  getImageUrl,
  preWeddingImages,
  ceremonyImages,
} from "../../services/cloudinary";

export default function GallerySection({ firestoreGallery }) {
  const [currentTab, setCurrentTab] = useState("prewedding");
  const [lightboxSrc, setLightboxSrc] = useState(null);

  let images = [];
  if (firestoreGallery && firestoreGallery.length > 0) {
    images = firestoreGallery.filter((g) => g.category === currentTab);
  } else {
    images =
      currentTab === "prewedding"
        ? preWeddingImages.map((id) => ({
            url: getImageUrl(id, { width: 800, height: 800, crop: "fill" }),
          }))
        : ceremonyImages.map((id) => ({
            url: getImageUrl(id, { width: 800, height: 800, crop: "fill" }),
          }));
  }

  return (
    <section className="py-24 px-6 bg-white text-black relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center px-4 mb-12">
          <h3 className="font-moul sm:text-3xl text-amber-600 underline underline-offset-8 decoration-amber-200/50 leading-loose">
            វិចិត្រសាលរូបភាព
          </h3>
          <p className="text-gray-500 mt-4 font-kantumruy">
            អនុស្សាវរីយ៍ដ៏ស្រស់ស្អាតរបស់យើង
          </p>
        </div>

        {/* Gallery Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setCurrentTab("prewedding")}
            className={`px-6 py-2 rounded-full border border-amber-500 font-kantumruy transition-colors duration-300 ${
              currentTab === "prewedding"
                ? "bg-amber-500 text-white"
                : "bg-transparent text-amber-600 hover:bg-amber-50"
            }`}
          >
            Pre-Wedding
          </button>
          <button
            onClick={() => setCurrentTab("ceremony")}
            className={`px-6 py-2 rounded-full border border-amber-500 font-kantumruy transition-colors duration-300 ${
              currentTab === "ceremony"
                ? "bg-amber-500 text-white"
                : "bg-transparent text-amber-600 hover:bg-amber-50"
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
