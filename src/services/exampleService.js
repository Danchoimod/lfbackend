// This is where you would normally interact with Prisma or other data sources
// const { PrismaClient } = require('../generated/prisma');
// const prisma = new PrismaClient();

const getWelcomeMessage = async () => {
    return "Welcome to the Express API with clean architecture!";
};

module.exports = {
    getWelcomeMessage,
};
