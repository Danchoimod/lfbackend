const carouselService = require('../services/carouselService');

const getCarousels = async (req, res) => {
    try {
        const data = await carouselService.getAllCarousels();
        res.status(200).json({
            status: "success",
            data: data
        });
    } catch (error) {
        console.error('Error fetching carousels:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

module.exports = {
    getCarousels
};
