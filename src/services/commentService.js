const prisma = require('../utils/prisma');

const createComment = async (data) => {
    return prisma.comment.create({
        data: {
            content: data.content,
            userId: data.userId,
            packageId: parseInt(data.packageId),
            parentId: data.parentId ? parseInt(data.parentId) : null
        },
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
    });
};

const getCommentsByPackageId = async (packageId, query = {}) => {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
        prisma.comment.findMany({
            where: {
                packageId: parseInt(packageId),
                parentId: null // Only get top-level comments initially
            },
            skip: parseInt(skip),
            take: parseInt(limit),
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
        }),
        prisma.comment.count({
            where: {
                packageId: parseInt(packageId),
                parentId: null
            }
        })
    ]);

    return {
        comments,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};

const deleteComment = async (id, userId) => {
    // Check if the comment belongs to the user
    const comment = await prisma.comment.findUnique({
        where: { id: parseInt(id) }
    });

    if (!comment || comment.userId !== userId) {
        throw new Error('Not authorized to delete this comment');
    }

    return prisma.comment.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    createComment,
    getCommentsByPackageId,
    deleteComment
};
