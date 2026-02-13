const prisma = require("../utils/prisma");

async function getAllCategories() {
    return prisma.category.findMany({
        where: {
            parentId: null,
        },
        include: {
            children: true,
        },
    });
}

async function createCategory(data) {
    return prisma.category.create({
        data: {
            name: data.name,
            param: data.param,
            ...(data.parentId !== undefined && { parentId: data.parentId }),
        },
    });
}

async function updateCategory(id, data) {
    const { parentId, ...rest } = data;
    return prisma.category.update({
        where: { id: parseInt(id) },
        data: {
            ...rest,
            ...(parentId !== undefined && { parentId }),
        },
    });
}

async function getCategoryById(id) {
    return prisma.category.findUnique({
        where: { id: parseInt(id) },
    });
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    getCategoryById
};
