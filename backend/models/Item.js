const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Lost", "Found", "Claimed"],
      default: "Lost",
    },
    location: {
      type: String,
      required: [true, "Please specify the location"],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      required: [true, "Please provide a contact email"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ইউজার সিস্টেম পুরোপুরি কানেক্ট হলে true দিতে পারেন
    },
  },
  {
    timestamps: true, // এটি অটোমেটিক createdAt এবং updatedAt ফিল্ড যোগ করবে
  },
);

module.exports = mongoose.model("Item", itemSchema);
