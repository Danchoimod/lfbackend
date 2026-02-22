const reportService = require('../services/reportService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../exceptions/AppError');
const prisma = require('../utils/prisma');

const createReport = catchAsync(async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: { firebaseUid: req.user.uid }
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const { reason, targetUserId, packageId } = req.body;

    if (!targetUserId && !packageId) {
        return next(new AppError('Please provide a user or a package to report', 400));
    }

    const report = await reportService.createReport({
        reason,
        userId: user.id,
        targetUserId,
        packageId
    });

    res.status(201).json({
        status: 'success',
        data: { report }
    });
});

const getAllReports = catchAsync(async (req, res, next) => {
    const reports = await reportService.getAllReports();
    res.status(200).json({
        status: 'success',
        data: { reports }
    });
});

module.exports = {
    createReport,
    getAllReports
};
