"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const SubmitBtn = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? <Spinner className="size-5" /> : "LOG IN"}
    </button>
  );
};

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const formAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
     const res = await signIn("credentials", {
  redirect: false,
  email,
  password,
});

if (res?.ok) {
  toast.success("Logged In.");
  router.push("/");
  return;
}

if (res?.error === "EMAIL_NOT_VERIFIED") {
  try {
    const verificationRes = await fetch(
      "/api/auth/send-verification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const verificationData = await verificationRes.json();

    if (!verificationRes.ok) {
      toast.error(
        verificationData.message ||
          "Failed to send verification code."
      );
      return;
    }

    toast.success("Verification code sent to your email.");

    router.push(
      `/verify-email?email=${encodeURIComponent(email)}`
    );

    return;
  } catch (error) {
    console.error("Verification email error:", error);

    toast.error(
      "Failed to send verification code. Please try again."
    );

    return;
  }
}

toast.error("Invalid email or password.");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Form Side */}
        <div className="flex w-full items-center justify-center px-5 pt-24 pb-10 sm:px-6 sm:pt-28 sm:pb-12 md:px-8 md:pt-32 lg:w-full lg:px-12 lg:pt-[9rem] lg:pb-12">
          <div className="w-full max-w-[26rem] sm:max-w-[28rem] lg:max-w-[30rem]">
            {/* Heading */}
            <div className="mb-6 sm:mb-8 lg:mb-10 flex flex-col items-start gap-3 sm:gap-4 text-left">

              <h1 className="heading-3 text-black ">Sign In To Account</h1>
            </div>

            {/* Form */}
            <form action={formAction} className="space-y-4 sm:space-y-5 lg:space-y-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-[0.7rem] font-medium uppercase text-black/80 tracking-[0.05em]"
                >
                  Email <span className="text-black">*</span>
                </Label>

                <Input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  className="h-[2.75rem] rounded-[0.75rem] border-black/15 px-4 sm:h-[3rem] sm:px-5 lg:h-[3.2rem]"
                />
              </div>

              {/* Password */}
              <div className="relative flex w-full flex-col gap-2">
                <div className="flex w-full items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-[0.7rem] font-medium uppercase text-black/80 tracking-[0.05em]"
                  >
                    Password <span className="text-black">*</span>
                  </Label>

                  <Link
                    href="/forgot-password"
                    className="text-[0.75rem] text-muted-foreground transition-colors lg:text-[0.8rem] hover:text-[#ee0a0a] hover:underline hover:decoration-[#ee0a0a]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    autoComplete="current-password"
                    className="h-[2.75rem] rounded-[0.75rem] border-black/15 px-4 pr-[3rem] sm:h-[3rem] sm:px-5 sm:pr-[3.5rem] lg:h-[3.2rem]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-black/40 transition-colors hover:text-[#ee0a0a] sm:right-4"
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.5} className="sm:hidden" />
                    ) : (
                      <Eye size={18} strokeWidth={1.5} className="sm:hidden" />
                    )}
                    {showPassword ? (
                      <EyeOff size={20} strokeWidth={1.5} className="hidden sm:block" />
                    ) : (
                      <Eye size={20} strokeWidth={1.5} className="hidden sm:block" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <SubmitBtn />
              </div>
            </form>

            {/* Register */}
            <p className="mt-6 sm:mt-8 lg:mt-10 text-center text-[0.75rem] uppercase text-muted-foreground sm:text-[0.8rem] lg:text-[0.825rem]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-black underline transition-colors hover:text-[#ee0a0a]"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;