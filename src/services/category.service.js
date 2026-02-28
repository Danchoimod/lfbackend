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

    // 1. Tìm thông tin Category
    const category = await prisma.category.findFirst({
        where: { param: slug }
    });

    if (!category) return null;

    // 2. Lấy danh sách package kèm total count theo categoryId
    const [packages, total] = await Promise.all([
        prisma.package.findMany({
            where: {
                catId: category.id,
                status: 1
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            select: {
                id: true,
                title: true,
                slug: true,
                shortSummary: true,
                createdAt: true,
                ratingCount: true,
                ratingAvg: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        slug: true
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
        }),
        prisma.package.count({
            where: {
                catId: category.id,
                status: 1
            }
        })
    ]);

    const formattedPackages = packages.map(pkg => ({
        ...pkg,
        slug: pkg.slug || `${pkg.id}-${slugify(pkg.title)}`,
        user: {
            ...pkg.user,
            slug: pkg.user.slug || `${pkg.user.id}-${slugify(pkg.user.username)}`
        }
    }));

    return {
        category,
        packages: formattedPackages,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    getCategoryById,
    getPackagesByCategory
};
