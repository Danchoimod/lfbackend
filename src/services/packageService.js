const prisma = require('../utils/prisma');
const slugify = require('../utils/slugify');

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
                        name: true,
                        param: true
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
        prisma.package.count({ where })
    ]);

    const formattedPackages = packages.map(pkg => ({
        ...pkg,
        slug: `${pkg.id}-${slugify(pkg.title)}`,
        user: {
            ...pkg.user,
            slug: `${pkg.user.id}-${slugify(pkg.user.username)}`
        }
    }));

    return {
        packages: formattedPackages,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getPackageById = async (id) => {
    const pkg = await prisma.package.findUnique({
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
            urls: true,
            comments: {
                where: {
                    parentId: null
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true
                        }
                    },
                    replies: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatarUrl: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (pkg) {
        pkg.slug = `${pkg.id}-${slugify(pkg.title)}`;
        if (pkg.user) {
            pkg.user.slug = `${pkg.user.id}-${slugify(pkg.user.username)}`;
        }
    }

    return pkg;
};

const createPackage = async (data) => {
    return prisma.package.create({
        data: {
            title: data.title,
            description: data.description ?? null,
            shortSummary: data.shortSummary ?? null,
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
            ...(data.shortSummary !== undefined && { shortSummary: data.shortSummary }),
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