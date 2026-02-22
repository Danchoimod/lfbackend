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

module.exports = {
    getAllVersions
};
