import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Subscriber from "@/models/Subscriber";
import { sendEmailVerificationEmail } from "@/lib/email/send";

const isStrongPassword = (password: string) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    const emailUpdates =
      typeof body.emailUpdates === "boolean" ? body.emailUpdates : false;

    // ==========================================
    // Basic validation
    // ==========================================

    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 7) {
      return NextResponse.json(
        { message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    await connectDB();

    // ==========================================
    // Get current user
    // ==========================================

    const user = await User.findById(session.user.id).select(
      "+password +emailVerificationCode +emailVerificationCodeExpires +emailVerificationAttempts +pendingEmail name email phone"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const previousEmail = user.email.toLowerCase();
    const emailChanged = email !== previousEmail;

    // ==========================================
    // Password change
    // ==========================================

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required." },
          { status: 400 }
        );
      }

      const matches = await bcrypt.compare(currentPassword, user.password);

      if (!matches) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      if (!isStrongPassword(newPassword)) {
        return NextResponse.json(
          {
            message:
              "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and symbol.",
          },
          { status: 400 }
        );
      }

      user.password = await bcrypt.hash(newPassword, 12);
    }

    // ==========================================
    // Update non-email fields always
    // ==========================================

    user.name = name;
    user.phone = phone;

    // ==========================================
    // Email unchanged → save normally
    // ==========================================

    if (!emailChanged) {
      await user.save();

      // Email subscription for current email
      if (emailUpdates) {
        await Subscriber.findOneAndUpdate(
          { email: previousEmail },
          {
            $set: { email: previousEmail, isActive: true },
            $setOnInsert: { source: "profile" },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } else {
        await Subscriber.findOneAndUpdate(
          { email: previousEmail },
          { $set: { isActive: false } }
        );
      }

      return NextResponse.json({
        message: "Profile updated.",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          emailUpdates,
        },
      });
    }

    // ==========================================
    // Email is changing → require verification
    // ==========================================

    // Check new email is not already taken
    const taken = await User.exists({
      email,
      _id: { $ne: user._id },
    });

    if (taken) {
      return NextResponse.json(
        { message: "That email is already in use." },
        { status: 409 }
      );
    }

    // Do NOT update user.email yet
    // Store pending email + send verification code to the NEW address
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.pendingEmail = email;
    user.emailVerificationCode = code;
    user.emailVerificationCodeExpires = codeExpiresAt;
    user.emailVerificationAttempts = 0;

    await user.save();

    await sendEmailVerificationEmail(email, user.name, code);

    // Handle subscription preference against current (old) email for now
    // New email subscription will be handled after verification
    if (!emailUpdates) {
      await Subscriber.findOneAndUpdate(
        { email: previousEmail },
        { $set: { isActive: false } }
      );
    }

    return NextResponse.json({
      message: "We sent a verification code to your new email.",
      requiresEmailVerification: true,
      email, // the NEW email
      user: {
        name: user.name,
        email: previousEmail, // still the old email until verified
        phone: user.phone,
        emailUpdates,
      },
    });
  } catch (error) {
    console.error("PATCH /api/profile", error);

    return NextResponse.json(
      { message: "Failed to update profile." },
      { status: 500 }
    );
  }
}