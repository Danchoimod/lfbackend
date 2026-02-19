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

async function getUserProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
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
    });

    if (user) {
        user.slug = `${user.id}-${slugify(user.username)}`;
        if (user.packages) {
            user.packages = user.packages.map(pkg => ({
                ...pkg,
                slug: `${pkg.id}-${slugify(pkg.title)}`
            }));
        }
    }

    return user;
}

module.exports = {
    getUserByEmail,
    createUser,
    getUserProfile
};
