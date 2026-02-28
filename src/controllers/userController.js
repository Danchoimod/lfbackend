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
    const id = slug.split('-')[0];

    // Optional: Get current user ID if logged in to set isFollowing flag
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split(' ')[1];
        const admin = require("firebase-admin");
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const user = await userService.getUserByFirebaseUid(decodedToken.uid);
            if (user) currentUserId = user.id;
        } catch (error) {
            // Ignore token error for public profile route
        }
    }

    const userProfile = await userService.getUserProfile(id, currentUserId);

    if (!userProfile) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: userProfile
    });
});

const getFollowing = catchAsync(async (req, res, next) => {
    // For "my following", we need the DB ID of the current user
    const user = await userService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
        return next(new AppError('No user found', 404));
    }

    const { page = 1, limit = 10 } = req.query;
    const result = await userService.getFollowing(user.id, page, limit);

    res.status(200).json({
        status: 'success',
        ...result
    });
});

const toggleFollow = catchAsync(async (req, res, next) => {
    const { followingId } = req.body;

    // 1. Get current logged in user (follower)
    const follower = await userService.getUserByFirebaseUid(req.user.uid);
    if (!follower) {
        return next(new AppError('Follower user not found', 404));
    }

    // 2. Toggle follow status
    try {
        const result = await userService.toggleFollow(follower.id, followingId);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
});

const updateProfile = catchAsync(async (req, res, next) => {
    // 1. Get current logged in user
    const user = await userService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2. Update profile
    const updatedUser = await userService.updateProfile(user.id, req.body);

    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

module.exports = {
    getUserProfile,
    getMe,
    getFollowing,
    toggleFollow,
    updateProfile
};
