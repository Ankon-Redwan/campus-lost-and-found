const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 📝 ১. সাইন-আপ (Register) ফাংশন
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ফাঁকা ফিল্ড চেক করা
    if (!name || !email || !password) {
      return res.status(400).json({ message: "সবগুলো ফিল্ড পূরণ করুন! ⚠️" });
    }

    // যেকোনো ইমেইলের ফরম্যাট সঠিক আছে কি না চেক করা
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "সঠিক ইমেইল অ্যাড্রেস দিন! ❌" });
    }

    // ইমেইল আগে থেকেই আছে কি না চেক করা
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "এই ইমেল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে! 😮" });
    }

    // পাসওয়ার্ড সিকিউর/হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // নতুন ইউজার তৈরি ও সেভ করা
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "অ্যাকাউন্ট তৈরি সফল হয়েছে! 🎉" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔐 ২. লগইন (Login) ফাংশন
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ফাঁকা ফিল্ড চেক করা
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "ইমেইল এবং পাসওয়ার্ড দুটিই দিন! ⚠️" });
    }

    // ইউজার খোঁজা
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "ভুল ইমেল বা পাসওয়ার্ড! ❌" });
    }

    // পাসওয়ার্ড ম্যাচ করে কি না চেক করা
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "ভুল ইমেল বা পাসওয়ার্ড! ❌" });
    }

    // JWT Token তৈরি করা
    const token = jwt.sign({ id: user._id }, "secret123", { expiresIn: "1d" });

    res.status(200).json({
      message: "লগইন সফল হয়েছে! 🚀",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
