import React from "react";
import { getImageUrl } from "../../services/cloudinary";

export default function ProfileSection({ weddingDetails }) {
  const groomImg = weddingDetails?.groomImageId
    ? getImageUrl(weddingDetails.groomImageId, { width: 500, height: 500, crop: "fill" })
    : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500";

  const brideImg = weddingDetails?.brideImageId
    ? getImageUrl(weddingDetails.brideImageId, { width: 500, height: 500, crop: "fill" })
    : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=500";

  return (
    <section className="py-24 px-6 bg-white text-black relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center px-4 mb-16">
          <h3 className="font-moul sm:text-3xl text-amber-600 underline underline-offset-8 decoration-amber-200/50 leading-loose">
            ប្រវត្តិរូបសង្ខេប
          </h3>
          <p className="text-gray-500 mt-4 font-kantumruy">
            កូនកំលោះ និងកូនក្រមុំ
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Groom Profile */}
          <div className="flex flex-col items-center group">
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-gold p-1 shadow-2xl mb-6 relative">
              <img
                src={groomImg}
                alt="Groom"
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <h4 className="font-moul text-2xl text-amber-800 mb-2">
              {weddingDetails?.groomName || "ឈ្មោះ កូនកំលោះ"}
            </h4>
            <p className="text-gray-500 text-center max-w-sm font-kantumruy leading-relaxed">
              {weddingDetails?.groomStory || "កូនប្រុសទី១ ក្នុងគ្រួសារ។ បច្ចុប្បន្នជាវិស្វករផ្នែកទន់។"}
            </p>
          </div>

          {/* Bride Profile */}
          <div className="flex flex-col items-center group">
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-gold p-1 shadow-2xl mb-6 relative">
              <img
                src={brideImg}
                alt="Bride"
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <h4 className="font-moul text-2xl text-amber-800 mb-2">
              {weddingDetails?.brideName || "ឈ្មោះ កូនក្រមុំ"}
            </h4>
            <p className="text-gray-500 text-center max-w-sm font-kantumruy leading-relaxed">
              {weddingDetails?.brideStory || "កូនស្រីទី២ ក្នុងគ្រួសារ។ បច្ចុប្បន្នជាវេជ្ជបណ្ឌិត។"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
