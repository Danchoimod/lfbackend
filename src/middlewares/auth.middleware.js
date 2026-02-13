const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const { join } = require("path");

// Đọc file service account
const serviceAccountPath = join(process.cwd(), "lastfom-launcher-firebase-adminsdk-fbsvc-da8ffa2d47.json");
let serviceAccount;
try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
} catch (error) {
    console.error("Error reading service account file:", error.message);
}

// Khởi tạo Firebase Admin
if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://lastfom-launcher-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
}

const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.split("Bearer ")[1];
    if (!idToken) {
        return res.status(401).json({ error: "Unauthorized", message: "Missing token" });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ error: "Unauthorized", message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

const checkAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.split("Bearer ")[1];
    if (!idToken) {
        return res.status(401).json({ error: "Unauthorized", message: "Missing token" });
    }
    try {
        // 1. Kiểm tra Token có hợp lệ không
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // 2. Kiểm tra xem Email có phải là Admin không
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        if (decodedToken.email !== ADMIN_EMAIL) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Bạn không có quyền thực hiện thao tác này"
            });
        }
        // 3. Nếu đúng là Admin, lưu thông tin và cho đi tiếp
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error("Admin check error:", error);
        res.status(403).json({ error: "Forbidden", message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

module.exports = {
    checkAuth,
    checkAdmin
};
