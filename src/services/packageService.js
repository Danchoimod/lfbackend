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
                slug: true,
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
                        status: true,
                        slug: true
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

const getPackageById = async (idOrSlug) => {
    let where = {};
    if (isNaN(idOrSlug)) {
        where = { slug: idOrSlug, status: 1 };
    } else {
        where = { id: parseInt(idOrSlug), status: 1 };
    }

    const include = {
        user: {
            select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
                status: true,
                slug: true
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
                        avatarUrl: true,
                        slug: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                username: true,
                                avatarUrl: true,
                                slug: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }
    };

    let pkg = await prisma.package.findFirst({
        where,
        include
    });

    // Fallback: If not found and input was a slug with a numeric prefix (id-name)
    if (!pkg && isNaN(idOrSlug) && idOrSlug.includes('-')) {
        const idPart = idOrSlug.split('-')[0];
        const id = parseInt(idPart);
        if (!isNaN(id)) {
            pkg = await prisma.package.findFirst({
                where: { id: id, status: 1 },
                include
            });
        }
    }

    return pkg;
};

const createPackage = async (data) => {
    const slug = `${slugify(data.title)}-${Date.now()}`;
    return prisma.package.create({
        data: {
            title: data.title,
            slug,
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
    const updateData = {
        ...(data.title !== undefined && {
            title: data.title,
            slug: `${slugify(data.title)}-${id}`
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortSummary !== undefined && { shortSummary: data.shortSummary }),
        ...(data.changelog !== undefined && { changelog: data.changelog }),
        ...(data.catId !== undefined && { catId: parseInt(data.catId) }),
        ...(data.status !== undefined && { status: data.status }),
    };

    return prisma.package.update({
        where: { id: parseInt(id) },
        data: updateData,
    });
};

const getUserPackages = async (userId, query = {}) => {
    const { page = 1, limit = 5, status } = query;
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
                slug: true,
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

    return pkg;
};

const createMyPackage = async (userId, data) => {
    const { status, images, urls, versions, ...createData } = data;
    const slug = `${slugify(createData.title)}-${Date.now()}`;

    const createPayload = {
        title: createData.title,
        slug,
        description: createData.description ?? null,
        shortSummary: createData.shortSummary ?? null,
        changelog: createData.changelog ?? null,
        userId: parseInt(userId),
        catId: parseInt(createData.catId),
        status: 0,
    };

    if (images && Array.isArray(images)) {
        createPayload.images = {
            create: images.map(img => ({
                url: typeof img === 'string' ? img : img.url
            }))
        };
    }

    if (urls && Array.isArray(urls)) {
        createPayload.urls = {
            create: urls.map(u => ({
                name: u.name,
                url: u.url
            }))
        };
    }

    if (versions && Array.isArray(versions)) {
        const versionIds = versions
            .filter(v => v.id)
            .map(v => ({ id: parseInt(v.id) }));

        createPayload.versions = {
            connect: versionIds
        };
    }

    return prisma.package.create({
        data: createPayload,
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

const updateMyPackage = async (userId, id, data) => {
    const { status, images, urls, versions, ...updateData } = data;

    const updatePayload = {
        ...(updateData.title !== undefined && {
            title: updateData.title,
            slug: `${slugify(updateData.title)}-${id}`
        }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.shortSummary !== undefined && { shortSummary: updateData.shortSummary }),
        ...(updateData.changelog !== undefined && { changelog: updateData.changelog }),
        ...(updateData.catId !== undefined && { catId: parseInt(updateData.catId) }),
        status: 0,
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

    if (versions && Array.isArray(versions)) {
        const versionIds = versions
            .filter(v => v.id)
            .map(v => ({ id: parseInt(v.id) }));

        updatePayload.versions = {
            set: versionIds
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

const deleteMyPackage = async (userId, id) => {
    return prisma.package.delete({
        where: {
            id: parseInt(id),
            userId: parseInt(userId)
        }
    });
};

module.exports = {
    createMyPackage,
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    getUserPackages,
    getMyPackageById,
    updateMyPackage,
    deleteMyPackage
};
