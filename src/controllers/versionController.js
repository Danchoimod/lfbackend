const versionService = require('../services/versionService');
const catchAsync = require('../utils/catchAsync');

const getAllVersions = catchAsync(async (req, res, next) => {
    const versions = await versionService.getAllVersions();

    res.status(200).json({
        status: 'success',
        data: {
            versions
        }
    });
});

const createVersion = catchAsync(async (req, res, next) => {
    const version = await versionService.createVersion(req.body);

    res.status(201).json({
        status: 'success',
        data: { version }
    });
});

const updateVersion = catchAsync(async (req, res, next) => {
    const version = await versionService.updateVersion(req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        data: { version }
    });
});

const deleteVersion = catchAsync(async (req, res, next) => {
    await versionService.deleteVersion(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllVersions,
    createVersion,
    updateVersion,
    deleteVersion
};
