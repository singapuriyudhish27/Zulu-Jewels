import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 5) {
        return NextResponse.json({ found: false });
    }

    try {
        // Call Nominatim server-side (avoids browser CORS & User-Agent blocking)
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "ZuluJewels/1.0 (zulujewels@gmail.com)",
                    "Accept-Language": "en"
                }
            }
        );

        const data = await res.json();

        if (data && data.length > 0) {
            return NextResponse.json({
                found: true,
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                display_name: data[0].display_name
            });
        }

        return NextResponse.json({ found: false });
    } catch (error) {
        console.error("Geocode API error:", error);
        return NextResponse.json({ found: false }, { status: 500 });
    }
}
