const { Router } = require("express");
const prisma = require("../utils/prisma");

const router = Router();

router.get("/", async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
