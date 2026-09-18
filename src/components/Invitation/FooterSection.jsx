import React from "react";
import { Heart, Send, Share2, Link as LinkIcon } from "lucide-react";

export default function FooterSection({ showToast }) {
  const shareTo = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      "សូមគោរពអញ្ជើញចូលរួមពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ"
    );

    if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank"
      );
    } else if (platform === "copy") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast("បានចម្លងតំណភ្ជាប់ជោគជ័យ!", "success");
      });
    }
  };

  return (
    <footer className="py-12 sm:py-16 px-4 text-center bg-black/50 backdrop-blur-md border-t border-white/10 relative">
      <div className="max-w-xl mx-auto glass-box p-8 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="p-3 bg-rose-500/20 rounded-full border border-rose-500/30">
            <Heart className="text-red-500 fill-red-500 animate-pulse w-7 h-7" />
          </div>
        </div>

        <h3 className="font-moul text-2xl sm:text-3xl gold-text mb-4">សូមអរគុណ</h3>

        <p className="text-gray-200 text-sm sm:text-base leading-relaxed italic font-light px-2">
          " វត្តមានរបស់លោកអ្នក គឺជាកិត្តិយសដ៏ខ្ពង់ខ្ពស់សម្រាប់ក្រុមគ្រួសារយើងខ្ញុំ។ <br />
          សូមជូនពរឱ្យលោកអ្នកទទួលបាននូវសុភមង្គល និង សេចក្តីសុខគ្រប់ប្រការ។ "
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => shareTo("telegram")}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-500/25 cursor-pointer"
            title="Share on Telegram"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => shareTo("facebook")}
            className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-2xl transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-700/25 cursor-pointer"
            title="Share on Facebook"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => shareTo("copy")}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all duration-300 hover:scale-110 border border-white/20 cursor-pointer"
            title="Copy Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 text-[11px] text-amber-300/60 tracking-[0.4em] uppercase font-semibold">
          FEBRUARY 2030
        </div>
      </div>
    </footer>
  );
}
