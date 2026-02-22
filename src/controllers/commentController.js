const commentService = require('../services/commentService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../exceptions/AppError');
const prisma = require('../utils/prisma');

const createComment = catchAsync(async (req, res, next) => {
    // We need to find the internal user ID from the firebase UID (req.user.uid)
    const user = await prisma.user.findUnique({
        where: { firebaseUid: req.user.uid }
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const data = {
        ...req.body,
        userId: user.id
    };

    const comment = await commentService.createComment(data);

    res.status(201).json({
        status: 'success',
        data: {
            comment: {
                ...comment,
                isMine: true
            }
        }
    });
});

const getCommentsByPackageId = catchAsync(async (req, res, next) => {
    // Optional: Get current user ID if logged in to set isMine flag
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split(' ')[1];
        const admin = require("firebase-admin");
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const user = await prisma.user.findUnique({
                where: { firebaseUid: decodedToken.uid }
            });
            if (user) currentUserId = user.id;
        } catch (error) {
            // Ignore token error for public route
        }
    }

    const result = await commentService.getCommentsByPackageId(req.params.packageId, req.query, currentUserId);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

const deleteComment = catchAsync(async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: { firebaseUid: req.user.uid }
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    await commentService.deleteComment(req.params.id, user.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    createComment,
    getCommentsByPackageId,
    deleteComment
};
