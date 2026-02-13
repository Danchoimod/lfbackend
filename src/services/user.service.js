const prisma = require("../utils/prisma");

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

module.exports = {
    getUserByEmail,
    createUser
};
