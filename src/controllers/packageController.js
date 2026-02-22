const packageService = require('../services/packageService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../exceptions/AppError');

const getAllPackages = catchAsync(async (req, res, next) => {
    const result = await packageService.getAllPackages(req.query);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

const getPackageById = catchAsync(async (req, res, next) => {
    const pkg = await packageService.getPackageById(req.params.id);

    if (!pkg) {
        return next(new AppError('No package found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            package: pkg
        }
    });
});

const createPackage = catchAsync(async (req, res, next) => {
    // req.user is populated by checkAuth middleware (Firebase localId)
    const data = { ...req.body, userId: req.user.uid };
    const pkg = await packageService.createPackage(data);

    res.status(201).json({
        status: 'success',
        data: {
            package: pkg
        }
    });
});

const updatePackage = catchAsync(async (req, res, next) => {
    const pkg = await packageService.updatePackage(req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        data: {
            package: pkg
        }
    });
});

const getMyPackages = catchAsync(async (req, res, next) => {
    // 1. Get current user DB ID from Firebase UID (req.user is set by checkAuth)
    const userService = require('../services/user.service');
    const user = await userService.getUserByFirebaseUid(req.user.uid);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2. Fetch packages for this user
    const result = await packageService.getUserPackages(user.id, req.query);

    res.status(200).json({
        status: 'success',
        ...result
    });
});

const getMyPackageDetail = catchAsync(async (req, res, next) => {
    // 1. Get current user DB ID from Firebase UID
    const userService = require('../services/user.service');
    const user = await userService.getUserByFirebaseUid(req.user.uid);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2. Fetch package detail for this user
    const pkg = await packageService.getMyPackageById(user.id, req.params.id);

    if (!pkg) {
        return next(new AppError('Package not found or you do not have permission', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            package: pkg
        }
    });
});

const updateMyPackage = catchAsync(async (req, res, next) => {
    // 1. Get current user DB ID from Firebase UID
    const userService = require('../services/user.service');
    const user = await userService.getUserByFirebaseUid(req.user.uid);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2. Update package
    const pkg = await packageService.updateMyPackage(user.id, req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        data: {
            package: pkg
        }
    });
});

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    getMyPackages,
    getMyPackageDetail,
    updateMyPackage
};
