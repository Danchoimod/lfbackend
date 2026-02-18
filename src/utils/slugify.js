const slugify = (text) => {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Thay khoảng trắng bằng -
        .replace(/[^\w\-]+/g, "") // Xóa ký tự đặc biệt
        .replace(/\-\-+/g, "-") // Xóa gạch ngang thừa
        .trim();
};

module.exports = slugify;
