import React from "react";
import * as Icons from "lucide-react";

export default function TimelineSection({ events }) {
  // Helper to dynamically render a Lucide icon by string name
  const renderIcon = (iconName) => {
    // Convert hyphenated string like 'flower-2' or 'utensils-crossed' to PascalCase
    const pascalName = iconName
      ? iconName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")
      : "Flower2";

    const IconComponent = Icons[pascalName] || Icons[iconName] || Icons.Flower2;
    return <IconComponent className="w-6 h-6" />;
  };

  const defaultEvents = [
    {
      id: "def-1",
      title: "ពិធីក្រុងពាលី",
      time: "ម៉ោង ២:០០ រសៀល",
      desc: "ជួបជុំសាច់ញាតិ ដើម្បីសុំសេចក្តីសុខសេចក្តីចម្រើន។",
      icon: "flower-2",
    },
    {
      id: "def-2",
      title: "ពិធីសូត្រមន្ត",
      time: "ម៉ោង ៤:០០ រសៀល",
      desc: "និមន្តព្រះសង្ឃចម្រើនព្រះបរិត្ត។",
      icon: "sparkles",
    },
    {
      id: "def-3",
      title: "ពិធីហែជំនូន",
      time: "ម៉ោង ៧:០០ ព្រឹក (ថ្ងៃបន្ទាប់)",
      desc: "ដង្ហែរជំនូនចូលរោងជ័យ។",
      icon: "gift",
    },
    {
      id: "def-4",
      title: "ពិធីកាត់សក់",
      time: "ម៉ោង ៩:០០ ព្រឹក",
      desc: "កាត់សក់បង្កក់សិរី និងបណ្ដេញឧបទ្រពចង្រៃ។",
      icon: "scissors",
    },
    {
      id: "def-5",
      title: "ពិធីចងដៃ",
      time: "ម៉ោង ១០:៣០ ព្រឹក",
      desc: "សាច់ញាតិចាស់ទុំចងដៃជូនពរជ័យសិរីសួស្តី។",
      icon: "gem",
    },
    {
      id: "def-6",
      title: "ពិធីពិសាភោជនាហារ",
      time: "ម៉ោង ៤:០០ រសៀល",
      desc: "សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយសទាំងអស់ពិសាភោជនាហារ។",
      icon: "utensils-crossed",
    },
  ];

  const list = events && events.length > 0 ? events : defaultEvents;

  return (
    <section className="py-24 px-6 bg-slate-50 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center px-4 mb-16">
          <h3 className="font-moul sm:text-3xl text-amber-600 underline underline-offset-8 decoration-amber-200/50 leading-loose">
            កម្មវិធីតាមប្រពៃណី
          </h3>
          <p className="text-gray-500 mt-4 font-kantumruy">
            លំដាប់លំដោយនៃកម្មវិធី
          </p>
        </div>

        <div className="relative border-l-2 border-amber-300 ml-3 md:ml-6 space-y-12">
          {list.map((ev) => (
            <div key={ev.id || ev.title} className="relative pl-10 md:pl-16 group">
              <div className="absolute -left-[11px] bg-amber-500 w-5 h-5 rounded-full border-4 border-white shadow group-hover:scale-125 transition-transform duration-300"></div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow flex gap-4 items-start">
                <div className="bg-amber-50 p-3 rounded-xl text-amber-600 hidden sm:block">
                  {renderIcon(ev.icon)}
                </div>
                <div>
                  <h4 className="font-moul text-lg text-amber-700 mb-2">
                    {ev.title}
                  </h4>
                  <p className="text-amber-600 font-bold mb-2">{ev.time}</p>
                  <p className="text-gray-600 text-sm">{ev.desc || ev.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
