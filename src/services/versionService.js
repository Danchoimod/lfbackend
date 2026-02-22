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

module.exports = {
    getAllVersions
};
