const router = require("express").Router();
const { register, login } = require("../controllers/authController");

// রেজিস্ট্রেশন — uses authController.register
router.post("/register", register);

// লগইন — uses authController.login
router.post("/login", login);

module.exports = router;
