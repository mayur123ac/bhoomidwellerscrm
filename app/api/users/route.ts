// File: app/api/users/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/user"; // Notice the lowercase 'user'

export const POST = async (request: Request) => {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password, name, role, secretKey } = body;

    // 1. Check for duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // 2. Validate Admin Secret Key
    if (role === 'admin' && secretKey !== 'admin123') {
      return NextResponse.json({ message: "Invalid Admin Secret Key" }, { status: 403 });
    }

    // 3. Create user
    const newUser = new User({ email, password, name, role });
    await newUser.save();

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });

  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

// Add this to the BOTTOM of app/api/users/route.ts
export const GET = async () => {
  try {
    await connectDB();
    const users = await User.find({}, 'name email role'); // Only fetch name, email, role
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
};