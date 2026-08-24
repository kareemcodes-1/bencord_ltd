"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen items-center justify-center px-5 pt-[9rem] pb-[4rem] sm:px-6">
        <div className="w-full max-w-[26rem] sm:max-w-[28rem]">
          <div className="mb-8 flex flex-col items-start gap-3 text-left sm:mb-10">
            <span className="subtitle">Forgot Password</span>
            <h1 className="heading-3 text-black">Reset your password</h1>
            <p className="text-sm text-muted-foreground">
              Enter the email associated with your account and we’ll send you a
              link to reset your password.
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">
                We’ve sent a password reset link to <strong>{email}</strong>.
                Please check your inbox (and spam folder).
              </div>

              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="text-black underline transition-colors hover:text-[#ee0a0a]"
                >
                  Back to login
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80"
                >
                  Email <span className="text-black">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="h-[2.75rem] rounded-full border-black/15 px-4 sm:h-[3rem] sm:px-5 lg:h-[3.2rem]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? <Spinner className="size-5" /> : "Send reset link"}
              </button>

              <p className="pt-2 text-center text-[0.75rem] uppercase text-muted-foreground sm:text-[0.8rem]">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-black underline transition-colors hover:text-[#ee0a0a]"
                >
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}