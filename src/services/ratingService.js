const prisma = require('../utils/prisma');

const ratePackage = async (userId, packageId, score) => {
    // 1. Upsert the rating
    await prisma.rating.upsert({
        where: {
            userId_packageId: {
                userId: parseInt(userId),
                packageId: parseInt(packageId)
            }
        },
        update: {
            score: parseInt(score)
        },
        create: {
            userId: parseInt(userId),
            packageId: parseInt(packageId),
            score: parseInt(score)
        }
    });

    // 2. Recalculate ratingCount and ratingAvg for the package
    const ratings = await prisma.rating.findMany({
        where: { packageId: parseInt(packageId) },
        select: { score: true }
    });

    const ratingCount = ratings.length;
    const ratingAvg = ratings.reduce((acc, curr) => acc + curr.score, 0) / ratingCount;

    // 3. Update the package
    return prisma.package.update({
        where: { id: parseInt(packageId) },
        data: {
            ratingCount,
            ratingAvg: parseFloat(ratingAvg.toFixed(2))
        }
    });
};

const getMyRating = async (userId, packageId) => {
    return prisma.rating.findUnique({
        where: {
            userId_packageId: {
                userId: parseInt(userId),
                packageId: parseInt(packageId)
            }
        }
    });
};

module.exports = {
    ratePackage,
    getMyRating
};
