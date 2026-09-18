import React from "react";

export default function LocationSection({ mapUrl }) {
  if (!mapUrl) return null;

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-amber-50 to-white text-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center px-4 mb-16">
          <h3 className="font-moul sm:text-3xl text-amber-600 underline underline-offset-8 decoration-amber-200/50 leading-loose">
            ទីតាំង ដើម្បីចូលរួម
          </h3>
          <p className="text-gray-500 mt-4 font-kantumruy">
            សូមគោរពអញ្ជើញលោក លោកស្រី អញ្ជើញចូលរួមតាមទីតាំងដែលបានបង្ហាញខាងក្រោម
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl">
            <iframe
              src={mapUrl}
              className="w-full h-[500px]"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              title="Wedding Location Map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
