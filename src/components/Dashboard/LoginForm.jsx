import React, { useState } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "../../firebase/config";
import { KeyRound, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginForm({ showToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  
  const [isResetView, setIsResetView] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resetErrorMsg, setResetErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "អាខោនអ៊ីមែលនេះមិនទាន់មាននៅក្នុង Firebase Authentication ទេ! (User not found)";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!";
      case "auth/invalid-email":
        return "ទម្រង់អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវទេ!";
      case "auth/too-many-requests":
        return "បានព្យាយាមច្រើនដងពេក! សូមរង់ចាំមួយសន្ទុះ រួចព្យាយាមម្តងទៀត។";
      default:
        return "មានបញ្ហាក្នុងការភ្ជាប់ជាមួយ Firebase។ សូមពិនិត្យមើល Email ឬ Network។";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      const friendlyMsg = getFirebaseErrorMessage(error.code);
      setErrorMsg(friendlyMsg);
      if (showToast) showToast(friendlyMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const targetEmail = (resetEmail || email).trim();

    if (!targetEmail) {
      setResetErrorMsg("សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក!");
      return;
    }

    setResetLoading(true);
    setResetErrorMsg("");
    setResetSent(false);

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSent(true);
      if (showToast)
        showToast(
          `បានផ្ញើ Link កំណត់លេខសម្ងាត់ឡើងវិញទៅកាន់ ${targetEmail} ជោគជ័យ!`,
          "success"
        );
    } catch (error) {
      console.error("Reset password error:", error.code, error.message);
      const friendlyMsg = getFirebaseErrorMessage(error.code);
      setResetErrorMsg(friendlyMsg);
      if (showToast) showToast(friendlyMsg, "error");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 transition-all duration-300">
        
        {/* VIEW 1: Reset Password Form */}
        {isResetView ? (
          <div>
            <div className="mb-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 text-amber-500">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="font-moul text-xl text-amber-600">
                កំណត់លេខសម្ងាត់ឡើងវិញ
              </h1>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                សូមបញ្ចូលអ៊ីមែលរបស់អ្នក។ យើងខ្ញុំនឹងផ្ញើតំណភ្ជាប់ (Link) សម្រាប់ផ្លាស់ប្តូរលេខសម្ងាត់ថ្មីទៅកាន់ Email នោះ។
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  អ៊ីមែល (Email)
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail || email}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {resetErrorMsg && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>{resetErrorMsg}</div>
                </div>
              )}

              {resetSent && (
                <div className="rounded-xl bg-emerald-50 p-4 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">ផ្ញើបានជោគជ័យ!</strong>
                    បានផ្ញើ Link Reset ទៅកាន់អ៊ីមែលរបស់អ្នកហើយ។ សូមពិនិត្យមើលប្រអប់ Inbox ឬ Spam ក្នុង Email របស់អ្នក។
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {resetLoading ? "កំពុងផ្ញើ..." : "ផ្ញើ Link Reset"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetView(false);
                  setResetSent(false);
                  setResetErrorMsg("");
                }}
                className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-2 flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" /> ត្រឡប់ទៅទំព័រចូលគណនី (Back to Login)
              </button>
            </form>
          </div>
        ) : (
          /* VIEW 2: Login Form */
          <div>
            <div className="mb-6 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-500">
                Wedding Dashboard
              </p>
              <h1 className="mt-2 font-moul text-2xl text-amber-600">ចូលគណនី</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Protected admin access for RSVP management and analytics.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  អ៊ីមែល (Email)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    ពាក្យសម្ងាត់ (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsResetView(true);
                    }}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    ភ្លេចពាក្យសម្ងាត់?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? "កំពុងចូល..." : "ចូល (Login)"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
