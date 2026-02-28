const { Router } = require("express");
const { login, googleLogin, discordLogin, discordCallback, getDiscordAuthUrl, signup, logout } = require("../controllers/auth.controller.js");
const { checkAuth } = require("../middlewares/auth.middleware.js");

const router = Router();

router.post("/login", login);
router.post("/google", googleLogin);
router.get("/discord/url", getDiscordAuthUrl);
router.get("/discord/callback", discordCallback);
router.post("/discord", discordLogin);
router.post("/signup", signup);
router.post("/logout", checkAuth, logout);

module.exports = router;

