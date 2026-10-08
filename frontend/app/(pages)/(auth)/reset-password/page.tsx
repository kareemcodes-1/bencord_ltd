"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Password updated successfully!");
      router.push("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-sm text-muted-foreground">
          Invalid or expired reset link.
        </p>
        <Link
          href="/forgot-password"
          className="text-black underline hover:text-[#ee0a0a]"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* New Password */}
      <div className="relative flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80"
        >
          New Password <span className="text-black">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-[2.75rem] rounded-[0.75rem] border-black/15 px-4 pr-12 sm:h-[3rem] sm:px-5"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#ee0a0a]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="confirmPassword"
          className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80"
        >
          Confirm Password <span className="text-black">*</span>
        </Label>
        <Input
          type={showPassword ? "text" : "password"}
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="h-[2.75rem] rounded-[0.75rem] border-black/15 px-4 sm:h-[3rem] sm:px-5"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Spinner className="size-5" /> : "Reset password"}
      </button>

      <p className="pt-2 text-center text-[0.75rem] uppercase text-muted-foreground">
        <Link
          href="/login"
          className="text-black underline hover:text-[#ee0a0a]"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen items-center justify-center px-5 pt-[9rem] pb-[4rem] sm:px-6">
        <div className="w-full max-w-[26rem] sm:max-w-[28rem]">
          <div className="mb-8 flex flex-col items-start gap-3 text-left sm:mb-10">
            <span className="subtitle">Reset Password</span>
            <h1 className="heading-3 text-black">Create new password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          <Suspense fallback={<Spinner className="mx-auto size-6" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}