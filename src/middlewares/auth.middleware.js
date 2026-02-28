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

module.exports = {
    checkAuth
};
