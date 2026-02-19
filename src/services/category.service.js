const prisma = require("../utils/prisma");
const slugify = require("../utils/slugify");

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

async function getPackagesByCategory(slug, query = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const result = await prisma.category.findFirst({
        where: { param: slug },
        include: {
            packages: {
                skip: parseInt(skip),
                take: parseInt(limit),
                select: {
                    id: true,
                    title: true,
                    shortSummary: true,
                    createdAt: true,
                    ratingCount: true,
                    ratingAvg: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    images: {
                        take: 1,
                        select: {
                            url: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (result && result.packages) {
        result.packages = result.packages.map(pkg => ({
            ...pkg,
            slug: `${pkg.id}-${slugify(pkg.title)}`,
            user: {
                ...pkg.user,
                slug: `${pkg.user.id}-${slugify(pkg.user.username)}`
            }
        }));
    }

    return result;
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    getCategoryById,
    getPackagesByCategory
};
