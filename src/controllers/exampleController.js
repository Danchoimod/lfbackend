const exampleService = require('../services/exampleService');
const catchAsync = require('../utils/catchAsync');

const hello = catchAsync(async (req, res, next) => {
    const message = await exampleService.getWelcomeMessage();

    res.status(200).json({
        status: 'success',
        data: {
            message,
        },
    });
});

module.exports = {
    hello,
};
