const Item = require('../models/Item');

// ১. সব আইটেমের লিস্ট ডাটাবেজ থেকে নিয়ে আসার লজিক
const getItems = async (req, res) => {
  try {
    // নতুন আইটেমগুলো সবার ওপরে দেখানোর জন্য sort করা হয়েছে
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. ডাটাবেজে নতুন হারানো বা প্রাপ্তি বিজ্ঞপ্তি যোগ করার লজিক
const createItem = async (req, res) => {
  const { title, description, status, category, location, contactEmail } = req.body;

  // কোনো ঘর ফাঁকা আছে কিনা চেক করা
  if (!title || !description || !status || !category || !location || !contactEmail) {
    return res.status(400).json({ message: 'দয়া করে সব ঘর পূরণ করুন' });
  }

  try {
    const newItem = await Item.create({
      title, description, status, category, location, contactEmail
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// লজিকগুলো বাইরে ব্যবহারের জন্য এক্সপোর্ট করা হলো
module.exports = { getItems, createItem };