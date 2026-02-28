const appUpdateService = require('../services/appUpdateService');
const catchAsync = require('../utils/catchAsync');

const getAllAppUpdates = catchAsync(async (req, res, next) => {
    const appUpdates = await appUpdateService.getAllAppUpdates();

    res.status(200).json({
        status: 'success',
        data: {
            appUpdates
        }
    });
});

const getLatestAppUpdate = catchAsync(async (req, res, next) => {
    const { platform } = req.params;

    if (platform === 'all') {
        const windows = await appUpdateService.getLatestAppUpdate('windows');
        const android = await appUpdateService.getLatestAppUpdate('android');
        return res.status(200).json({
            status: 'success',
            data: {
                windows,
                android
            }
        });
    }

    const appUpdate = await appUpdateService.getLatestAppUpdate(platform);

    res.status(200).json({
        status: 'success',
        data: {
            appUpdate
        }
    });
});

const createAppUpdate = catchAsync(async (req, res, next) => {
    const appUpdate = await appUpdateService.createAppUpdate(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            appUpdate
        }
    });
});

module.exports = {
    getAllAppUpdates,
    getLatestAppUpdate,
    createAppUpdate
};
