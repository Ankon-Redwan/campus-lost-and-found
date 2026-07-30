const express = require("express");
const router = express.Router();
const Item = require("../models/Item"); // তোমার মডেলের নাম অন্য হলে সেটা চেক করে নিও
const multer = require("multer");
const path = require("path");

// 📸 ছবি কোথায় এবং কী নামে সেভ হবে তার কনফিগারেশন
// ছবিগুলো রুট uploads ফোল্ডারে জমা হবে (প্রজেক্টের রুট লেভেল)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// 📥 সব নোটিশ ডাটাবেজ থেকে নিয়ে আসার API (GET)
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

// ➕ নতুন নোটিশ যোগ করার API - ছবি আপলোডসহ (POST)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, status, category, location, contactEmail } =
      req.body;

    // ছবির রিলেটিভ পাথ তৈরি (যেমন: uploads/filename.ext)
    // server.js রুট uploads/ ফোল্ডার থেকে স্ট্যাটিক ফাইল সার্ভ করে
    const image = req.file ? `uploads/${req.file.filename}` : "";

    const newItem = new Item({
      title,
      description,
      status,
      category,
      location,
      contactEmail,
      image,
    });

    await newItem.save();
    res
      .status(201)
      .json({ message: "Notice posted successfully! 🎉", newItem });
  } catch (error) {
    res.status(500).json({ message: "Error creating item", error });
  }
});

// 🗑️ নোটিশ ডিলিট করার API (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Item.findByIdAndDelete(id);
    res.status(200).json({ message: "Notice deleted successfully! 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
});

// 🔄 নোটিশের স্ট্যাটাস Resolved করার API (PUT)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { status: "Resolved" },
      { new: true },
    );
    res
      .status(200)
      .json({ message: "Item status updated to Resolved! 🎉", updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
});

module.exports = router;
