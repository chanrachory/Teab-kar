import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  FileSpreadsheet,
  FileText,
  Moon,
  Sun,
  LogOut,
  Home,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { auth, signOut } from "../../firebase/config";

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  darkMode,
  onToggleDarkMode,
  onExportCSV,
  onExportPDF,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth);
  };

  const navItems = [
    {
      id: "overview",
      label: "សង្ខេប & ទិន្នន័យ",
      subLabel: "Overview & Analytics",
      icon: LayoutDashboard,
    },
    {
      id: "guests",
      label: "បញ្ជីភ្ញៀវ & Link អញ្ជើញ",
      subLabel: "RSVP & Invitation Links",
      icon: Users,
    },
    {
      id: "timeline",
      label: "កម្មវិធីតាមប្រពៃណី",
      subLabel: "Timeline Schedule",
      icon: Calendar,
    },
    {
      id: "settings",
      label: "ព័ត៌មាន & រូបភាព",
      subLabel: "Wedding Info & Media",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Top Header Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 mb-4 rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
            <Heart className="w-5 h-5 fill-amber-500" />
          </div>
          <span className="font-moul text-lg text-amber-600">Teab-Kar Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } lg:block w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-8 h-fit`}
      >
        <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between gap-6">
          {/* Header Brand */}
          <div>
            <div className="flex items-center gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 flex items-center justify-center">
                <Heart className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-500 font-bold">
                  Admin Panel
                </p>
                <h1 className="font-moul text-lg text-amber-600">
                  គ្រប់គ្រងព័ត៌មានធៀបការ
                </h1>
              </div>
            </div>

            {/* Vertical Navigation Links */}
            <div className="mt-6 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                Navigation
              </p>
              {navItems.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border transition-all duration-200 flex items-center gap-3 text-left ${
                      isActive
                        ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-amber-50 hover:border-amber-200 dark:bg-slate-800/60 dark:border-slate-700/80 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white dark:bg-slate-700 text-amber-500 shadow-sm"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate leading-snug">
                        {tab.label}
                      </p>
                      <p
                        className={`text-[10px] truncate ${
                          isActive
                            ? "text-amber-100"
                            : "text-slate-400 dark:text-slate-400"
                        }`}
                      >
                        {tab.subLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Preferences */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Actions & Preferences
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportCSV}
                className="p-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV
              </button>
              <button
                onClick={onExportPDF}
                className="p-2.5 rounded-2xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4" /> PDF
              </button>
            </div>

            <button
              onClick={onToggleDarkMode}
              className="w-full p-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" /> Dark Mode
                </>
              )}
            </button>

            <Link
              to="/"
              target="_blank"
              className="w-full p-2.5 rounded-2xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Home className="w-4 h-4" /> Invitation Page
            </Link>

            <button
              onClick={handleLogout}
              className="w-full p-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
