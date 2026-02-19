import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Call the actual backend API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && (data.status === "success" || data.idToken)) {
            const token = data.data?.token || data.idToken;

            if (!token) {
                return NextResponse.json(
                    { status: "error", message: "No token received from backend" },
                    { status: 500 }
                );
            }

            // Set cookie using next/headers
            const cookieStore = await cookies();
            cookieStore.set({
                name: "token",
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: data.expiresIn ? parseInt(data.expiresIn) : 60 * 60 * 24 * 7,
            });

            // Return success
            return NextResponse.json({
                status: "success",
                data: {
                    user: data.data?.user || { email: data.email, localId: data.localId }
                }
            });
        }

        return NextResponse.json(
            { status: "error", message: data.message || "Login failed" },
            { status: response.status }
        );
    } catch (error) {
        console.error("API Route Login Error:", error);
        return NextResponse.json(
            { status: "error", message: "Internal server error" },
            { status: 500 }
        );
    }
}
