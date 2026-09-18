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
    <footer className="hero-bg py-32 px-6 text-center border-t border-white/10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 flex justify-center">
          <Heart className="text-red-500 fill-red-500 scale-[2] inline-block animate-pulse w-8 h-8" />
        </div>
        <h3 className="font-moul text-4xl gold-text mb-8">សូមអរគុណ</h3>
        <p className="text-gray-200 text-xl leading-loose italic">
          " វត្តមានរបស់លោកអ្នក គឺជាកិត្តិយសដ៏ខ្ពង់ខ្ពស់សម្រាប់ក្រុមគ្រួសារយើងខ្ញុំ។ <br />
          សូមជូនពរឱ្យលោកអ្នកទទួលបាននូវសុភមង្គល និង សេចក្តីសុខគ្រប់ប្រការ។ "
        </p>
        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={() => shareTo("telegram")}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-transform hover:scale-110 shadow-lg"
            title="Share on Telegram"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={() => shareTo("facebook")}
            className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full transition-transform hover:scale-110 shadow-lg"
            title="Share on Facebook"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => shareTo("copy")}
            className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-transform hover:scale-110 shadow-lg"
            title="Copy Link"
          >
            <LinkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-20 opacity-30 text-xs tracking-[0.5em]">
          FEBRUARY 2030
        </div>
      </div>
    </footer>
  );
}
