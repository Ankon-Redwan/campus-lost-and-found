const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^[\w-\.]+@diu\.edu\.bd$/, 'Please use your institutional email only'] // ড্যাফোডিল ইমেইল ভ্যালিডেশন
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);