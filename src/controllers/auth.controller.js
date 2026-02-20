const admin = require("firebase-admin");
const { createUser, getUserByEmail } = require("../services/user.service.js");

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: "Authentication failed",
                details: data.error?.message || "Unknown error",
            });
        }
        res.json({
            idToken: data.idToken,
            email: data.email,
            localId: data.localId,
            expiresIn: data.expiresIn,
        });
    }
    catch (error) {
        console.error("Login controller error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function signup(req, res) {
    try {
        const { email, password, username, displayName, avatarUrl } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: "Firebase registration failed",
                details: data.error?.message || "Unknown error",
            });
        }
        const firebaseUid = data.localId;
        const newUser = await createUser({
            email,
            firebaseUid,
            username,
            displayName,
            avatarUrl
        });
        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
            idToken: data.idToken,
            expiresIn: data.expiresIn
        });
    }
    catch (error) {
        console.error("Signup controller error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
}

async function logout(req, res) {
    try {
        const uid = req.user.uid;
        if (!uid) {
            return res.status(401).json({ error: "Unauthorized", message: "User session not found" });
        }

        // Revoke all refresh tokens for the user
        await admin.auth().revokeRefreshTokens(uid);

        // Optionally, you can also force a password change or other security measures
        // For now, revoking tokens is what prevents future refreshes.

        res.json({
            message: "Successfully logged out and sessions revoked",
            uid: uid
        });
    } catch (error) {
        console.error("Logout controller error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
}

module.exports = {
    login,
    signup,
    logout
};

