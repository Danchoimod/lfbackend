const prisma = require('../utils/prisma');

const getAllPackages = async (query = {}) => {
    const { page = 1, limit = 10, search, catId } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
        where.title = { contains: search };
    }
    if (catId) {
        where.catId = parseInt(catId);
    }

    const [packages, total] = await Promise.all([
        prisma.package.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                },
                category: true,
                images: true,
                versions: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.package.count({ where })
    ]);

    return {
        packages,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getPackageById = async (id) => {
    return await prisma.package.findUnique({
        where: { id: parseInt(id) },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true
                }
            },
            category: true,
            versions: {
                orderBy: {
                    createdAt: 'desc'
                }
            },
            images: true,
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });
};

const createPackage = async (data) => {
    return prisma.package.create({
        data: {
            title: data.title,
            description: data.description ?? null,
            changelog: data.changelog ?? null,
            userId: data.userId,
            catId: parseInt(data.catId),
            status: data.status ?? 0,
        },
    });
};

const updatePackage = async (id, data) => {
    return prisma.package.update({
        where: { id: parseInt(id) },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.changelog !== undefined && { changelog: data.changelog }),
            ...(data.catId !== undefined && { catId: parseInt(data.catId) }),
            ...(data.status !== undefined && { status: data.status }),
        },
    });
};

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage
};
