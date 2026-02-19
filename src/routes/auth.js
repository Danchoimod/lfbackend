const { Router } = require("express");
const { login, signup, logout } = require("../controllers/auth.controller.js");
const { checkAuth } = require("../middlewares/auth.middleware.js");

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", checkAuth, logout);

module.exports = router;

