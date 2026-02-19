const prisma = require('../utils/prisma');
const slugify = require('../utils/slugify');

const getAllCarousels = async () => {
    const carousels = await prisma.carousel.findMany({
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true
                }
            },
            package: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedCarousels = carousels.map(item => ({
        title: item.title,
        summary: item.summary,
        imageUrl: item.imageUrl,
        category: item.category,
        user: {
            avatar: item.user.avatarUrl,
            username: item.user.username,
            slug: `${item.user.id}-${slugify(item.user.username)}`
        },
        package: item.package ? {
            id: item.package.id,
            slug: `${item.package.id}-${slugify(item.package.title)}`
        } : null
    }));

    return formattedCarousels;
};

module.exports = {
    getAllCarousels
};
