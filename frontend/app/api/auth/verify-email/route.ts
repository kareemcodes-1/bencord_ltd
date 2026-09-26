import { NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    const code = String(body?.code ?? "").trim();

    if (!email || !code) {
      return NextResponse.json(
        {
          message: "Email and verification code are required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select(
      "+emailVerificationCode +emailVerificationCodeExpires +emailVerificationLoginToken +emailVerificationLoginTokenExpires",
    );

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          message: "Email is already verified.",
        },
        { status: 400 },
      );
    }

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
      return NextResponse.json(
        {
          message: "No active verification code. Please request a new one.",
        },
        { status: 400 },
      );
    }

    if (user.emailVerificationCodeExpires < new Date()) {
      return NextResponse.json(
        {
          message: "Verification code has expired.",
        },
        { status: 400 },
      );
    }

    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        {
          message: "Invalid verification code.",
        },
        { status: 400 },
      );
    }

    // Generate one-time login token
    const loginToken = crypto.randomBytes(32).toString("hex");

    const hashedLoginToken = crypto
      .createHash("sha256")
      .update(loginToken)
      .digest("hex");

    // Mark email as verified
    user.emailVerified = true;

    // Clear verification code
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    user.emailVerificationAttempts = 0;

    // Store hashed login token
    user.emailVerificationLoginToken = hashedLoginToken;

    // Login token expires in 5 minutes
    user.emailVerificationLoginTokenExpires = new Date(
      Date.now() + 5 * 60 * 1000,
    );

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully.",
        loginToken,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify email error:", error);

    return NextResponse.json(
      {
        message: "Failed to verify email.",
      },
      { status: 500 },
    );
  }
}
