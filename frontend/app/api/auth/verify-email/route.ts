import { NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Subscriber from "@/models/Subscriber";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    const code = String(body?.code ?? "").trim();

    const purpose = String(body?.purpose ?? "").trim();

    if (!email || !code) {
      return NextResponse.json(
        {
          message: "Email and verification code are required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // ==========================================
    // Find user
    // ==========================================

    let user;

    if (purpose === "change") {
      // During an email change, the user's actual email
      // is still the old email.
      // The new email is stored in pendingEmail.
      user = await User.findOne({
        pendingEmail: email,
      }).select(
        "+emailVerificationCode +emailVerificationCodeExpires +emailVerificationAttempts +pendingEmail",
      );
    } else {
      // Normal signup verification
      user = await User.findOne({ email }).select(
        "+emailVerificationCode +emailVerificationCodeExpires +emailVerificationLoginToken +emailVerificationLoginTokenExpires",
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    // ==========================================
    // Email-change verification
    // ==========================================

    if (purpose === "change" && user.pendingEmail) {
      if (
        !user.emailVerificationCode ||
        !user.emailVerificationCodeExpires
      ) {
        return NextResponse.json(
          {
            message:
              "No active verification code. Please request a new one.",
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

      // ==========================================
      // Code is correct → apply new email
      // ==========================================

      const oldEmail = user.email.toLowerCase();
      const newEmail = user.pendingEmail.toLowerCase();

      // Make sure another account hasn't taken
      // the new email while verification was pending.
      const emailTaken = await User.exists({
        email: newEmail,
        _id: { $ne: user._id },
      });

      if (emailTaken) {
        return NextResponse.json(
          {
            message: "That email is already in use.",
          },
          { status: 409 },
        );
      }

      // Apply the new email.
      user.email = newEmail;
      user.pendingEmail = undefined;
      user.emailVerified = true;

      // Clear verification fields.
      user.emailVerificationCode = undefined;
      user.emailVerificationCodeExpires = undefined;
      user.emailVerificationAttempts = 0;

      await user.save();

      // ==========================================
      // Move email subscription
      // ==========================================

      const emailUpdates =
        typeof body?.emailUpdates === "boolean"
          ? body.emailUpdates
          : false;

      if (emailUpdates) {
        // Subscribe the new email.
        await Subscriber.findOneAndUpdate(
          { email: newEmail },
          {
            $set: {
              email: newEmail,
              isActive: true,
            },
            $setOnInsert: {
              source: "profile",
            },
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );

        // Deactivate the old email subscription.
        await Subscriber.findOneAndUpdate(
          { email: oldEmail },
          {
            $set: {
              isActive: false,
            },
          },
        );
      } else {
        // User doesn't want email updates.
        // Deactivate both subscriptions.
        await Subscriber.findOneAndUpdate(
          { email: oldEmail },
          {
            $set: {
              isActive: false,
            },
          },
        );

        await Subscriber.findOneAndUpdate(
          { email: newEmail },
          {
            $set: {
              isActive: false,
            },
          },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Email updated successfully.",
          email: user.email,
        },
        { status: 200 },
      );
    }

    // ==========================================
    // Normal signup verification
    // ==========================================

    if (user.emailVerified) {
      return NextResponse.json(
        {
          message: "Email is already verified.",
        },
        { status: 400 },
      );
    }

    if (
      !user.emailVerificationCode ||
      !user.emailVerificationCodeExpires
    ) {
      return NextResponse.json(
        {
          message:
            "No active verification code. Please request a new one.",
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

    // ==========================================
    // Generate one-time login token
    // ==========================================

    const loginToken = crypto.randomBytes(32).toString("hex");

    const hashedLoginToken = crypto
      .createHash("sha256")
      .update(loginToken)
      .digest("hex");

    // Mark email as verified.
    user.emailVerified = true;

    // Clear verification code.
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    user.emailVerificationAttempts = 0;

    // Store hashed login token.
    user.emailVerificationLoginToken = hashedLoginToken;

    // Login token expires in 5 minutes.
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