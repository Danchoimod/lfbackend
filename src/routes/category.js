const { Router } = require("express");
const { createCategory, getCategories, updateCategory, getPackagesByCategory } = require("../controllers/category.controller.js");
const { checkAdmin } = require("../middlewares/auth.middleware.js");

const router = Router();

router.get("/", getCategories);
router.get("/:slug/packages", getPackagesByCategory);
router.post("/", checkAdmin, createCategory);
router.put("/:id", checkAdmin, updateCategory);

module.exports = router;
