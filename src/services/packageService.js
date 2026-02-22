const prisma = require('../utils/prisma');
const slugify = require('../utils/slugify');

const getAllPackages = async (query = {}) => {
    const { page = 1, limit = 10, search, catId } = query;
    const skip = (page - 1) * limit;

    const where = { status: 1 };
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { shortSummary: { contains: search } }
        ];
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
                        displayName: true,
                        username: true,
                        avatarUrl: true,
                        status: true
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
    const pkg = await prisma.package.findFirst({
        where: {
            id: parseInt(id),
            status: 1
        },
        include: {
            user: {
                select: {
                    id: true,
                    displayName: true,
                    username: true,
                    avatarUrl: true,
                    status: true
                }
            },
            category: true,
            versions: {
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    platformType: true,
                    versionNumber: true
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
                            displayName: true,
                            username: true,
                            avatarUrl: true
                        }
                    },
                    replies: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    displayName: true,
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

const getUserPackages = async (userId, query = {}) => {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where = { userId: parseInt(userId) };
    if (status !== undefined) {
        where.status = parseInt(status);
    }

    const [packages, total] = await Promise.all([
        prisma.package.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                versions: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        id: true,
                        platformType: true,
                        versionNumber: true
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
        slug: `${pkg.id}-${slugify(pkg.title)}`
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

const getMyPackageById = async (userId, id) => {
    const pkg = await prisma.package.findFirst({
        where: {
            id: parseInt(id),
            userId: parseInt(userId)
        },
        include: {
            category: true,
            versions: {
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    platformType: true,
                    versionNumber: true
                }
            },
            images: true,
            urls: true
        }
    });

    if (pkg) {
        pkg.slug = `${pkg.id}-${slugify(pkg.title)}`;
    }

    return pkg;
};

const updateMyPackage = async (userId, id, data) => {
    // Explicitly remove status from data to prevent status updates via this API
    const { status, images, urls, versions, ...updateData } = data;

    const updatePayload = {
        ...(updateData.title !== undefined && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.shortSummary !== undefined && { shortSummary: updateData.shortSummary }),
        ...(updateData.changelog !== undefined && { changelog: updateData.changelog }),
        ...(updateData.catId !== undefined && { catId: parseInt(updateData.catId) }),
    };

    if (images && Array.isArray(images)) {
        updatePayload.images = {
            deleteMany: {},
            create: images.map(img => ({
                url: typeof img === 'string' ? img : img.url
            }))
        };
    }

    if (urls && Array.isArray(urls)) {
        updatePayload.urls = {
            deleteMany: {},
            create: urls.map(u => ({
                name: u.name,
                url: u.url
            }))
        };
    }

    // Update versions if provided
    if (versions && Array.isArray(versions)) {
        updatePayload.versions = {
            deleteMany: {}, // Xóa hết version cũ
            create: versions.map(v => ({
                platformType: v.platformType,
                versionNumber: v.versionNumber
            }))
        };
    }

    return prisma.package.update({
        where: {
            id: parseInt(id),
            userId: parseInt(userId)
        },
        data: updatePayload,
        include: {
            images: true,
            urls: true,
            versions: {
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    platformType: true,
                    versionNumber: true
                }
            },
            category: true
        }
    });
};

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    getUserPackages,
    getMyPackageById,
    updateMyPackage
};