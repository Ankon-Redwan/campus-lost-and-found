export default function About() {
  return (
    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl text-center py-16 transition-all">
      <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 uppercase tracking-wide">
        About Our Platform 🔍
      </h1>
      <p className="text-slate-300 leading-relaxed text-base max-w-2xl mx-auto mb-10">
        আমাদের এই{" "}
        <span className="text-cyan-400 font-bold">'Campus Lost & Found'</span>{" "}
        প্ল্যাটফর্মটির মূল উদ্দেশ্য হলো বিশ্ববিদ্যালয়ের শিক্ষার্থীদের হারিয়ে
        যাওয়া প্রয়োজনীয় জিনিসপত্র দ্রুত, নিরাপদ এবং রিয়েল-টাইমে খুঁজে পেতে
        এবং প্রকৃত মালিকের কাছে ফেরত দিতে সাহায্য করা।
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* কার্ড ১ */}
        <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all shadow-lg group">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
            📸
          </div>
          <h3 className="text-lg font-extrabold mb-2 text-slate-100">
            ১. সরাসরি আপলোড
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            গ্যালারি বা ক্যামেরা থেকে সরাসরি রিয়েল ছবিসহ হারানো বা পাওয়া
            জিনিসের নোটিশ পোস্ট করুন।
          </p>
        </div>

        {/* কার্ড ২ */}
        <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all shadow-lg group">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
            🔍
          </div>
          <h3 className="text-lg font-extrabold mb-2 text-slate-100">
            ২. স্মার্ট সার্চিং
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            ক্যাটাগরি ফিল্টার এবং অ্যাডভান্সড লাইভ সার্চ দিয়ে চোখের পলকে
            নির্দিষ্ট জিনিসটি খুঁজে বের করুন।
          </p>
        </div>

        {/* কার্ড ৩ */}
        <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all shadow-lg group">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
            ✉️
          </div>
          <h3 className="text-lg font-extrabold mb-2 text-slate-100">
            ৩. নিরাপদ যোগাযোগ
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            সহজেই কন্ট্যাক্ট হোল্ডার বাটনে ক্লিক করে ইমেইলের মাধ্যমে সরাসরি
            প্রকৃত ব্যক্তির সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      {/* অতিরিক্ত ফুটার নোট */}
      <p className="text-[11px] text-slate-500 mt-12 tracking-wider uppercase font-semibold">
        Developed with 💙 for University Students
      </p>
    </div>
  );
}
