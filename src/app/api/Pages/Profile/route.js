import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import UserAddress from "@/lib/models/UserAddress";

//Get The Logged In User
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("zulu_jewels")?.value;

        //No Token -> Unauthorized
        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        //Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        const userId = decoded.userId;
        const email = decoded.email;

        //If Admin Login
        if (email === process.env.ADMIN_EMAIL) {
            const role = "Admin";
            const user = email;            
            return NextResponse.json({user, role, addresses: []}, {status: 200 });
        }

        //Fetch User From Database
        await connectDB();
        const user = await User.findOne({ _id: userId, email }).select('firstName lastName email phone');

        if (!user) {
            return NextResponse.json({message: "User Not Found"}, {status: 404});
        }

        // Fetch Saved Addresses
        const addresses = await UserAddress.find({ user_id: userId })
            .sort({ is_default: -1, created_at: 1 })
            .select('address_line is_default');

        const role = "User";

        return NextResponse.json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            },
            role,
            addresses
        }, {status: 200});
    } catch (error) {
        console.error("Profile API Error:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

//Update any Details
export async function PUT(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("zulu_jewels")?.value;

        //No Token -> Unauthorized
        if (!token) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        //Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
        const { userId, email } = decoded;
        const data = await request.json();

        //Database Connection
        await connectDB();

        //Update Password In Database
        if (data.currentPassword && data.newPassword) {
            const user = await User.findOne({ _id: userId, email }).select('password_hash');

            if (!user) {
                return NextResponse.json({ message: "User Not Found" }, { status: 404 });
            }

            const bcrypt = await import("bcryptjs");
            const isMatch = await bcrypt.compare(data.currentPassword, user.password_hash);

            if (!isMatch) {
                return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(data.newPassword, 10);
            await User.updateOne(
                { _id: userId, email },
                { password_hash: hashedPassword }
            );

            return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
        }

        //Update User In Database
        const { firstName, lastName, phone} = data;

        if (!firstName || !lastName || !phone) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const result = await User.updateOne(
            { _id: userId, email },
            { firstName: data.firstName, lastName: data.lastName, phone: data.phone }
        );
        if (result.matchedCount === 0) {
            return NextResponse.json({message: "User Not Found or No Changes Made"}, {status: 404});
        }
        return NextResponse.json({message: "Profile Updated Successfully"}, {status: 200});
    } catch (error) {
        console.error("Profile Update API Error:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

//Logout Route
export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('zulu_jewels')?.value;

    const response = NextResponse.json({message: "Logged Out Successfully", hadToken: !!token});

    //Remove the JWT cookie
    response.cookies.set("zulu_jewels", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "strict",
        path: "/",
        expires: new Date(0), //Imidiately expire the cookie
    });
    console.log("Response Cookies After Deletion:", response.cookies.getAll());
    return response;
}