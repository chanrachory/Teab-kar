import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsCharts({ rsvps }) {
  // Daily RSVPs calculation for Mon-Sun
  const daysLabels = [
    "ចន្ទ (Mon)",
    "អង្គារ (Tue)",
    "ពុធ (Wed)",
    "ព្រហស្បតិ៍ (Thu)",
    "សុក្រ (Fri)",
    "សៅរ៍ (Sat)",
    "អាទិត្យ (Sun)",
  ];
  const dailyCounts = Array(7).fill(0);

  rsvps.forEach((entry) => {
    const date = entry.timestamp?.toDate
      ? entry.timestamp.toDate()
      : new Date(entry.timestamp || Date.now());
    const day = date.getDay(); // 0 is Sun, 1 is Mon...
    dailyCounts[(day + 6) % 7] += 1;
  });

  const barData = {
    labels: daysLabels,
    datasets: [
      {
        label: "ចំនួន RSVP ប្រចាំថ្ងៃ",
        data: dailyCounts,
        backgroundColor: "rgba(245, 158, 11, 0.75)",
        borderColor: "#f59e0b",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { family: "Kantumruy Pro", size: 13 },
        bodyFont: { family: "Kantumruy Pro", size: 12 },
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Kantumruy Pro", size: 11 } },
      },
      y: {
        grid: { color: "rgba(226, 232, 240, 0.4)" },
        ticks: { precision: 0, font: { family: "Kantumruy Pro", size: 11 } },
      },
    },
  };

  // Status calculation: Attending vs Declined
  const attendingCount = rsvps.filter(
    (item) => item.status !== "declined"
  ).length;
  const declinedCount = rsvps.filter(
    (item) => item.status === "declined"
  ).length;

  const doughnutData = {
    labels: ["ចូលរួម (Attending)", "មិនចូលរួម (Declined)"],
    datasets: [
      {
        data: [attendingCount, declinedCount],
        backgroundColor: ["#10b981", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: "Kantumruy Pro", size: 12 },
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { family: "Kantumruy Pro", size: 13 },
        bodyFont: { family: "Kantumruy Pro", size: 12 },
        padding: 10,
        cornerRadius: 10,
      },
    },
    cutout: "70%",
  };

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      const d = value.toDate ? value.toDate() : new Date(value);
      return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const recentRsvps = rsvps.slice(0, 5);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {/* Chart 1: Daily RSVP Activity (2 Columns) */}
      <article className="xl:col-span-2 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold">
                RSVP Analytics
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                កំណើននៃការឆ្លើយតបប្រចាំសប្តាហ៍ (Daily Activity)
              </h3>
            </div>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {rsvps.length} Total
          </span>
        </div>

        <div className="h-64 w-full rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800">
          <Bar data={barData} options={barOptions} />
        </div>
      </article>

      {/* Chart 2: Status Breakdown Doughnut (1 Column) */}
      <article className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-500 font-bold">
                Attendance Breakdown
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ស្ថានភាពឆ្លើយតប
              </h3>
            </div>
          </div>
        </div>

        <div className="h-64 w-full relative flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {rsvps.length}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              RSVPs
            </span>
          </div>
        </div>
      </article>

      {/* Recent Activity Live Stream (3 Columns Full Span) */}
      <article className="xl:col-span-3 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-500 font-bold">
                Live Activity
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                សកម្មភាព RSVP ថ្មីៗចុងក្រោយ (Recent Activity Stream)
              </h3>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Stream
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {recentRsvps.length === 0 ? (
            <p className="col-span-full text-center text-xs text-slate-400 py-4">
              មិនទាន់មានសកម្មភាពថ្មីៗទេ
            </p>
          ) : (
            recentRsvps.map((item) => {
              const isDeclined = item.status === "declined";

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === "couple"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200"
                      }`}
                    >
                      {item.type === "couple" ? "Couple (x2)" : "Single"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {item.displayName || item.name1}
                  </h4>

                  <div className="mt-2 flex items-center gap-1 text-[11px]">
                    {isDeclined ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Declined
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Attending
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </article>
    </div>
  );
}
