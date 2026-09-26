"use client";

import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

const SubmitBtn = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary !w-full"
    >
      {pending ? <Spinner className="size-5" /> : "CREATE ACCOUNT"}
    </button>
  );
};

const Register = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /\d/.test(password),
    },
    {
      label: "One special character",
      valid: /[^A-Za-z\d]/.test(password),
    },
  ];

  const isStrongPassword = passwordRequirements.every(
    (requirement) => requirement.valid
  );

  const formAction = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !passwordValue || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!isStrongPassword) {
      toast.error(
        "Please create a stronger password that meets all the requirements."
      );
      return;
    }

    if (passwordValue !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password: passwordValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed.");
        return;
      }

      toast.success("Account created successfully.");

      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
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
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <h1 className="heading-3 text-black ">
                Create Your Account
              </h1>
            </div>

            {/* Form */}
            <form
              action={formAction}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              {/* Name */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="name"
                  className="text-[0.7rem] font-medium uppercase text-black/80 tracking-[0.05em]"
                >
                  Name <span className="text-black">*</span>
                </Label>

                <Input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  className="h-[2.75rem] rounded-[0.75rem] border-black/15 px-4 sm:h-[3rem] sm:px-5 lg:h-[3.2rem]"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-[0.7rem] font-medium tracking-[0.05em] uppercase text-black/80"
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
                <Label
                  htmlFor="password"
                  className="text-[0.7rem] font-medium tracking-[0.05em] uppercase text-black/80"
                >
                  Password <span className="text-black">*</span>
                </Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    autoComplete="new-password"
                    className="h-[2.75rem] rounded-[0.75rem] border-black/15 px-4 pr-[3rem] sm:h-[3rem] sm:px-5 sm:pr-[3.5rem] lg:h-[3.2rem]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
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

              {/* Confirm Password */}
              <div className="relative flex w-full flex-col gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[0.7rem] font-medium tracking-[0.05em] uppercase text-black/80"
                >
                  Confirm Password{" "}
                  <span className="text-black">*</span>
                </Label>

                <div className="relative">
                  <Input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    id="confirmPassword"
                    autoComplete="new-password"
                    className="h-[2.75rem] rounded-[0.75rem] border-black/15 px-4 pr-[3rem] sm:h-[3rem] sm:px-5 sm:pr-[3.5rem] lg:h-[3.2rem]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-black/40 transition-colors hover:text-[#ee0a0a] sm:right-4"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} strokeWidth={1.5} className="sm:hidden" />
                    ) : (
                      <Eye size={18} strokeWidth={1.5} className="sm:hidden" />
                    )}
                    {showConfirmPassword ? (
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

            {/* Login */}
            <p className="mt-6 sm:mt-8 lg:mt-10 text-center text-[0.75rem] uppercase text-muted-foreground sm:text-[0.8rem] lg:text-[0.825rem]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-black underline transition-colors hover:text-[#ee0a0a]"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;