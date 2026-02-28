const admin = require("firebase-admin");
const { createUser, getUserByEmail, getUserByFirebaseUid } = require("../services/user.service.js");

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

async function googleLogin(req, res) {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "ID Token is required" });
        }

        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, uid, name, picture } = decodedToken;

        // Check if user exists in database
        let user = await getUserByFirebaseUid(uid);

        if (!user) {
            // Create new user if doesn't exist
            // Extract a default username from email
            const defaultUsername = email.split('@')[0];

            user = await createUser({
                email,
                firebaseUid: uid,
                displayName: name || email,
                avatarUrl: picture || null,
                username: defaultUsername
            });
        }

        res.json({
            status: 'success',
            data: {
                user,
                idToken
            }
        });
    } catch (error) {
        console.error("Google Login controller error:", error);
        res.status(401).json({
            error: "Google authentication failed",
            details: error.message
        });
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

async function getDiscordAuthUrl(req, res) {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
    res.json({ url });
}

async function discordLogin(req, res) {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
        const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
        const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

        // 1. Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            return res.status(tokenResponse.status).json({
                error: "Discord token exchange failed",
                details: tokenData.error_description || tokenData.error
            });
        }

        const accessToken = tokenData.access_token;

        // 2. Get Discord user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const discordUser = await userResponse.json();
        if (!userResponse.ok) {
            return res.status(userResponse.status).json({
                error: "Failed to get Discord user info"
            });
        }

        const { id, username, avatar, email } = discordUser;
        const discordEmail = email || `${id}@discord.com`;
        const avatarUrl = avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null;

        // 3. Sync with Firebase
        let firebaseUser;
        try {
            firebaseUser = await admin.auth().getUserByEmail(discordEmail);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                firebaseUser = await admin.auth().createUser({
                    email: discordEmail,
                    displayName: username,
                    photoURL: avatarUrl,
                });
            } else {
                throw error;
            }
        }

        const firebaseUid = firebaseUser.uid;

        // 4. Sync with our DB
        let user = await getUserByFirebaseUid(firebaseUid);
        if (!user) {
            const defaultUsername = discordEmail.split('@')[0];
            user = await createUser({
                email: discordEmail,
                firebaseUid,
                displayName: username || discordEmail,
                avatarUrl,
                username: username || defaultUsername
            });
        }

        // 5. Generate Custom Token
        const customToken = await admin.auth().createCustomToken(firebaseUid);

        // 6. Exchange Custom Token for ID Token (to match existing login format)
        const exchangeUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
        const exchangeResponse = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: customToken,
                returnSecureToken: true
            })
        });

        const exchangeData = await exchangeResponse.json();
        if (!exchangeResponse.ok) {
            throw new Error(exchangeData.error?.message || "Failed to exchange custom token");
        }

        res.json({
            status: 'success',
            data: {
                user,
                idToken: exchangeData.idToken,
                refreshToken: exchangeData.refreshToken,
                expiresIn: exchangeData.expiresIn
            }
        });

    } catch (error) {
        console.error("Discord Login error:", error);
        res.status(500).json({
            error: "Discord authentication failed",
            details: error.message
        });
    }
}

async function discordCallback(req, res) {
    try {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
        const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
        const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

        // 1. Exchange code
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) throw new Error("Token exchange failed");

        const accessToken = tokenData.access_token;

        // 2. Get Info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const discordUser = await userResponse.json();

        const { id, username, avatar, email } = discordUser;
        const discordEmail = email || `${id}@discord.com`;
        const avatarUrl = avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null;

        // 3. Firebase Auth
        let firebaseUser;
        try {
            firebaseUser = await admin.auth().getUserByEmail(discordEmail);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                firebaseUser = await admin.auth().createUser({
                    email: discordEmail,
                    displayName: username,
                    photoURL: avatarUrl,
                });
            } else throw error;
        }

        // 4. Update local DB
        let user = await getUserByFirebaseUid(firebaseUser.uid);
        if (!user) {
            user = await createUser({
                email: discordEmail,
                firebaseUid: firebaseUser.uid,
                displayName: username,
                avatarUrl,
                username: username
            });
        }

        // 5. Generate Token and Redirect
        const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
        const exchangeUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
        const exchangeResponse = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: customToken, returnSecureToken: true })
        });
        const exchangeData = await exchangeResponse.json();

        // Chuyển hướng người dùng về Frontend kèm token
        res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${exchangeData.idToken}`);

    } catch (error) {
        console.error("Discord Callback error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
}

module.exports = {
    login,
    googleLogin,
    discordLogin,
    discordCallback,
    getDiscordAuthUrl,
    signup,
    logout
};

