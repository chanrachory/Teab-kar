import React from "react";
import {
  Users,
  HeartHandshake,
  User,
  CalendarDays,
  Utensils,
  XCircle,
} from "lucide-react";

export default function StatCards({ rsvps }) {
  const attending = rsvps.filter((item) => item.status !== "declined");

  let totalHeadCount = 0;
  attending.forEach((item) => {
    totalHeadCount += item.type === "couple" ? 2 : 1;
  });

  const coupleCount = rsvps.filter(
    (item) => item.type === "couple" && item.status !== "declined"
  ).length;

  const singleCount = rsvps.filter(
    (item) => item.type === "single" && item.status !== "declined"
  ).length;

  const declinedCount = rsvps.filter(
    (item) => item.status === "declined"
  ).length;

  const isToday = (value) => {
    if (!value) return false;
    const date = value.toDate ? value.toDate() : new Date(value);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const todayCount = rsvps.filter((item) => isToday(item.timestamp)).length;

  const estimatedTables = Math.ceil(totalHeadCount / 10);

  const cards = [
    {
      title: "ចំនួនភ្ញៀវសរុប (Headcount)",
      value: totalHeadCount,
      subtext: `${rsvps.length} RSVPs សរុប`,
      badge: "+Live",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: Users,
      iconBg: "bg-amber-500/10 text-amber-500",
      borderHover: "hover:border-amber-400",
    },
    {
      title: "ភ្ញៀវមកជាគូ (Couples)",
      value: coupleCount,
      subtext: `${coupleCount * 2} កៅអីសរុប`,
      badge: "Couple",
      badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
      icon: HeartHandshake,
      iconBg: "bg-pink-500/10 text-pink-500",
      borderHover: "hover:border-pink-400",
    },
    {
      title: "ភ្ញៀវមកទោល (Singles)",
      value: singleCount,
      subtext: `${singleCount} កៅអីសរុប`,
      badge: "Single",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      icon: User,
      iconBg: "bg-blue-500/10 text-blue-500",
      borderHover: "hover:border-blue-400",
    },
    {
      title: "RSVPs ថ្ងៃនេះ (Today)",
      value: todayCount,
      subtext: "ការឆ្លើយតបក្នុងថ្ងៃនេះ",
      badge: "Today",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      icon: CalendarDays,
      iconBg: "bg-indigo-500/10 text-indigo-500",
      borderHover: "hover:border-indigo-400",
    },
    {
      title: "ចំនួនតុប៉ាន់ស្មាន (Est. Tables)",
      value: estimatedTables,
      subtext: "គណនា ១០នាក់/តុ",
      badge: "10/Table",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      icon: Utensils,
      iconBg: "bg-purple-500/10 text-purple-500",
      borderHover: "hover:border-purple-400",
    },
    {
      title: "អវត្តមាន (Declined)",
      value: declinedCount,
      subtext: "មិនអាចចូលរួមបាន",
      badge: "Declined",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      icon: XCircle,
      iconBg: "bg-rose-500/10 text-rose-500",
      borderHover: "hover:border-rose-400",
    },
  ];

  return (
    <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 transition-all duration-300 ${card.borderHover} hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}
              >
                {card.badge}
              </span>
              <div
                className={`p-2.5 rounded-2xl ${card.iconBg} flex items-center justify-center`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              {card.title}
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {card.value}
            </h3>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </section>
  );
}
