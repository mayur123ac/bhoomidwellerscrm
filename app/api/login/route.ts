// File: app/api/login/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/user"; // Notice the lowercase 'user'

export const POST = async (request: Request) => {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    // Find user and check password
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful",
      role: user.role,
      name: user.name,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};