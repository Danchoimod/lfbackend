const { createCategory: createCategoryService, getAllCategories, updateCategory: updateCategoryService, getPackagesByCategory: getPackagesByCategoryService } = require("../services/category.service.js");

async function getCategories(req, res) {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getPackagesByCategory(req, res) {
    try {
        const { slug } = req.params;
        const result = await getPackagesByCategoryService(slug, req.query);

        if (!result) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({
            status: 'success',
            data: result
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function createCategory(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: "Request body is missing.",
                details: "Make sure you are sending JSON and the Content-Type header is set to application/json."
            });
        }
        const { name, param, parentId } = req.body;
        if (!name || !param) {
            return res.status(400).json({ error: "Name and param are required" });
        }
        const category = await createCategoryService({ name, param, parentId });
        res.status(201).json(category);
    }
    catch (error) {
        console.error("Create category error details:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
}

async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name, param, parentId } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Category ID is required" });
        }
        const category = await updateCategoryService(id, { name, param, parentId });
        res.json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getCategories,
    getPackagesByCategory,
    createCategory,
    updateCategory
};
