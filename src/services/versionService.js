const prisma = require('../utils/prisma');

const getAllVersions = async () => {
    const versions = await prisma.version.findMany({
        select: {
            id: true,
            versionNumber: true,
            url: true
        }
    });

    return versions.map(v => ({
        id: v.id,
        name: v.versionNumber,
        url: v.url
    }));
};

const createVersion = async (data) => {
    return prisma.version.create({
        data: {
            platformType: data.platformType ? parseInt(data.platformType) : null,
            versionNumber: data.versionNumber,
            url: data.url
        }
    });
};

const updateVersion = async (id, data) => {
    return prisma.version.update({
        where: { id: parseInt(id) },
        data: {
            ...(data.platformType !== undefined && { platformType: data.platformType ? parseInt(data.platformType) : null }),
            ...(data.versionNumber !== undefined && { versionNumber: data.versionNumber }),
            ...(data.url !== undefined && { url: data.url })
        }
    });
};

const deleteVersion = async (id) => {
    return prisma.version.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    getAllVersions,
    createVersion,
    updateVersion,
    deleteVersion
};
