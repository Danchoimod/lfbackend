const prisma = require("../utils/prisma");
const slugify = require("../utils/slugify");

async function getUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
    });
}

async function createUser(data) {
    return prisma.user.create({
        data,
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

async function getUserProfile(userId, currentUserId = null) {
    const [user, followRecord] = await Promise.all([
        prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                displayName: true,
                username: true,
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
        }),
        currentUserId ? prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: parseInt(currentUserId),
                    followingId: parseInt(userId)
                }
            }
        }) : null
    ]);

    if (user) {
        user.slug = `${user.id}-${slugify(user.username)}`;
        user.isFollowing = !!followRecord; // Trả về true/false
        if (user.packages) {
            user.packages = user.packages.map(pkg => ({
                ...pkg,
                slug: `${pkg.id}-${slugify(pkg.title)}`
            }));
        }
    }

    return user;
}

async function getFollowing(userId, page = 1, limit = 10) {
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
        slug: `${f.following.id}-${slugify(f.following.username)}`
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

    return prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
            ...(displayName !== undefined && { displayName }),
            ...(avatarUrl !== undefined && { avatarUrl }),
        },
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
