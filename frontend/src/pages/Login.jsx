import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google দিয়ে লগইন করার ফাংশন
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ইউজার ডাটা অবজেক্ট তৈরি
      const userData = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
      };

      // টোকেন এবং ইউজার ইনফো LocalStorage-এ সেভ করা
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(userData));

      alert(`স্বাগতম, ${user.displayName}! 🎉`);
      window.location.href = "/";
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError("Google দিয়ে লগইন করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/80 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl"
      >
        <h2 className="text-2xl font-black text-center text-white mb-2">
          লগইন করুন 🔐
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6">
          আপনার জিমেইল (Gmail) অ্যাকাউন্ট ব্যবহার করে সহজেই লগইন করুন
        </p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-center font-semibold break-words">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? "লগইন হচ্ছে... ⏳" : "Google দিয়ে লগইন করুন"}</span>
        </button>

        <div className="border-t border-white/5 mt-6 pt-4 text-center">
          <p className="text-xs text-slate-400">
            নতুন অ্যাকাউন্ট তৈরি করতে চান?{" "}
            <Link
              to="/register"
              className="text-cyan-400 font-bold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
