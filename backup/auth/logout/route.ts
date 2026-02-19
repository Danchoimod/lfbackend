import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (token) {
            // Proxy the logout request to the actual backend
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // We still clear our cookies even if backend call fails
            console.log(`[Logout] Backend response status: ${response.status}`);
        }

        // Clear the token cookie
        cookieStore.delete("token");

        return NextResponse.json({
            status: "success",
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return NextResponse.json(
            { status: "error", message: "Failed to logout" },
            { status: 500 }
        );
    }
}
