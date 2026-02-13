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

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage
};
