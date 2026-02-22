const prisma = require('../utils/prisma');

const createReport = async (data) => {
    return prisma.report.create({
        data: {
            reason: data.reason,
            userId: data.userId, // Reporter
            targetUserId: data.targetUserId ? parseInt(data.targetUserId) : null,
            packageId: data.packageId ? parseInt(data.packageId) : null
        }
    });
};

const getAllReports = async () => {
    return prisma.report.findMany({
        include: {
            user: { // Reporter
                select: { id: true, username: true, displayName: true }
            },
            targetUser: { // Reported User
                select: { id: true, username: true, displayName: true }
            },
            package: { // Reported Package
                select: { id: true, title: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = {
    createReport,
    getAllReports
};
