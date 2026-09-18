import React from "react";
import {
  FileSpreadsheet,
  FileText,
  ScanLine,
  Moon,
  Sun,
  LogOut,
  Home,
} from "lucide-react";
import { Link } from "react-router-dom";
import { auth, signOut } from "../../firebase/config";

export default function DashboardHeader({
  darkMode,
  onToggleDarkMode,
  onExportCSV,
  onExportPDF,
  onOpenQrScanner,
}) {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Admin overview
          </p>
          <h1 className="mt-2 font-moul text-2xl text-amber-600">
            គ្រប់គ្រងព័ត៌មានធៀបការ
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Track guests, RSVPs, and live wedding activity in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onToggleDarkMode}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 flex items-center gap-2 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            onClick={onExportCSV}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={onExportPDF}
            className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 flex items-center gap-2 transition"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={onOpenQrScanner}
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 flex items-center gap-2 transition"
          >
            <ScanLine className="w-4 h-4" /> Scan QR Check-In
          </button>
          <Link
            to="/"
            target="_blank"
            className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 flex items-center gap-2 transition"
          >
            <Home className="w-4 h-4" /> Invitation Page
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10 flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
