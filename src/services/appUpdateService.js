const prisma = require('../utils/prisma');

const getAllAppUpdates = async () => {
    return await prisma.appUpdate.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const getLatestAppUpdate = async (platform) => {
    return await prisma.appUpdate.findFirst({
        where: { platform },
        orderBy: {
            versionCode: 'desc'
        }
    });
};

const createAppUpdate = async (data) => {
    return await prisma.appUpdate.create({
        data: {
            platform: data.platform,
            versionName: data.versionName,
            versionCode: parseInt(data.versionCode),
            isForce: data.isForce === true || data.isForce === 'true',
            downloadUrl: data.downloadUrl,
            changelog: data.changelog
        }
    });
};

module.exports = {
    getAllAppUpdates,
    getLatestAppUpdate,
    createAppUpdate
};
