import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ১. ম্যানুয়াল ফর্ম সাবমিট (Backend API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://campus-lost-and-found-kijc.onrender.com";

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration Successful! 🎉 Now please login.");
        navigate("/login");
      } else {
        alert(data.message || "Registration Failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  // ২. Google দিয়ে ১-ক্লিকে রেজিস্ট্রেশন/লগইন
  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
      };

      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(userData));

      alert(`স্বাগতম, ${user.displayName}! 🎉`);
      window.location.href = "/";
    } catch (err) {
      console.error("Google Auth Error:", err);
      alert("Google দিয়ে সাইন-আপ করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl mt-12">
      <h2 className="text-2xl font-black text-white text-center mb-6 tracking-wide">
        Sign Up
      </h2>

      {/* Google Sign-Up Button */}
      <button
        onClick={handleGoogleRegister}
        disabled={loading}
        type="button"
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-lg mb-6"
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
        <span>
          {loading ? "সাইন-আপ হচ্ছে... ⏳" : "Google দিয়ে Sign Up করুন"}
        </span>
      </button>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-xs text-slate-400 font-semibold">
          অথবা ইমেইল দিয়ে
        </span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          required
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-xl border border-white/10 p-3 bg-slate-900/60 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        />
        <input
          type="email"
          placeholder="Enter Email Address"
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-xl border border-white/10 p-3 bg-slate-900/60 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full rounded-xl border border-white/10 p-3 bg-slate-900/60 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:scale-[1.02] transition-all shadow-lg cursor-pointer"
        >
          Register
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-cyan-400 font-bold hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
