const prisma = require("../utils/prisma");
const slugify = require("../utils/slugify");

async function getUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
    });
}

async function createUser(data) {
    const slug = `${slugify(data.username || data.displayName)}-${Date.now()}`;
    return prisma.user.create({
        data: {
            ...data,
            slug
        },
    });
}

async function getUserByFirebaseUid(firebaseUid) {
    return prisma.user.findUnique({
        where: { firebaseUid },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true
                }
            }
        }
    });
}

async function getUserProfile(idOrSlug, currentUserId = null) {
    let where = {};
    if (isNaN(idOrSlug)) {
        where = { slug: idOrSlug };
    } else {
        where = { id: parseInt(idOrSlug) };
    }

    let user = await prisma.user.findUnique({
        where,
        select: {
            id: true,
            displayName: true,
            username: true,
            slug: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
            _count: {
                select: {
                    followers: true
                }
            },
            packages: {
                where: { status: 1 },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    shortSummary: true,
                    createdAt: true,
                    ratingCount: true,
                    ratingAvg: true,
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
            }
        }
    });

    // Fallback: If not found and input was a slug with a numeric prefix (id-name)
    if (!user && isNaN(idOrSlug) && idOrSlug.includes('-')) {
        const idPart = idOrSlug.split('-')[0];
        const id = parseInt(idPart);
        if (!isNaN(id)) {
            user = await prisma.user.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    displayName: true,
                    username: true,
                    slug: true,
                    avatarUrl: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: {
                            followers: true
                        }
                    },
                    packages: {
                        where: { status: 1 },
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            shortSummary: true,
                            createdAt: true,
                            ratingCount: true,
                            ratingAvg: true,
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
                    }
                }
            });
        }
    }

    if (!user) return null;

    if (currentUserId) {
        const followRecord = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: parseInt(currentUserId),
                    followingId: user.id
                }
            }
        });
        user.isFollowing = !!followRecord;
    } else {
        user.isFollowing = false;
    }

    return user;
}

async function getFollowing(userId, page = 1, limit = 8) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
        prisma.follow.findMany({
            where: { followerId: parseInt(userId) },
            include: {
                following: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        slug: true,
                        avatarUrl: true
                    }
                }
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        }),
        prisma.follow.count({
            where: { followerId: parseInt(userId) }
        })
    ]);

    const data = following.map(f => ({
        id: f.following.id,
        avatar: f.following.avatarUrl,
        displayname: f.following.displayName,
        slug: f.following.slug
    }));

    return {
        data,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
}

async function toggleFollow(followerId, followingId) {
    if (parseInt(followerId) === parseInt(followingId)) {
        throw new Error('You cannot follow yourself');
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: parseInt(followerId),
                followingId: parseInt(followingId)
            }
        }
    });

    if (existingFollow) {
        await prisma.follow.delete({
            where: { id: existingFollow.id }
        });
        return { followed: false };
    } else {
        await prisma.follow.create({
            data: {
                followerId: parseInt(followerId),
                followingId: parseInt(followingId)
            }
        });
        return { followed: true };
    }
}


async function updateProfile(userId, data) {
    const { displayName, username, avatarUrl } = data;

    // Build update data
    const updateData = {
        ...(displayName !== undefined && { displayName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
    };

    // If username changes, update slug
    if (username !== undefined) {
        updateData.username = username;
        updateData.slug = `${slugify(username)}-${userId}`;
    }

    return prisma.user.update({
        where: { id: parseInt(userId) },
        data: updateData,
    });
}


module.exports = {
    getUserByEmail,
    createUser,
    getUserProfile,
    getUserByFirebaseUid,
    getFollowing,
    toggleFollow,
    updateProfile
};
