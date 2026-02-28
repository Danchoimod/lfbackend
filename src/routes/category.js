const { Router } = require("express");
const { createCategory, getCategories, updateCategory, getPackagesByCategory } = require("../controllers/category.controller.js");

const router = Router();

router.get("/", getCategories);
router.get("/:slug/packages", getPackagesByCategory);

module.exports = router;
