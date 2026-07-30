const mongoose = require("mongoose");

// হারানো বা প্রাপ্তি বিজ্ঞপ্তির ডাটা স্ট্রাকচার (Schema)
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "No description provided.",
    },
    status: {
      type: String,
      enum: ["Lost", "Found", "Resolved"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Item", itemSchema);
