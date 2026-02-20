const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../exceptions/AppError');

const getMe = catchAsync(async (req, res, next) => {
    const user = await userService.getUserByFirebaseUid(req.user.uid);

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user
    });
});

const getUserProfile = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    // Extract ID from slug (format: "id-username")
    const id = slug.split('-')[0];
    const userProfile = await userService.getUserProfile(id);

    if (!userProfile) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: userProfile
    });
});

module.exports = {
    getUserProfile,
    getMe
};
