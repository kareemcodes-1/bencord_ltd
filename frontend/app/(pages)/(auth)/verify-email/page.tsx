"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();

  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState<string[]>(
    Array(CODE_LENGTH).fill("")
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasAutoSubmitted = useRef(false);

  const codeValue = code.join("");

  const focusInput = (index: number) => {
    if (index >= 0 && index < CODE_LENGTH) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (!numbers) {
      const updatedCode = [...code];
      updatedCode[index] = "";
      setCode(updatedCode);
      return;
    }

    const digits = numbers.slice(0, CODE_LENGTH - index);
    const updatedCode = [...code];

    digits.split("").forEach((digit, offset) => {
      updatedCode[index + offset] = digit;
    });

    setCode(updatedCode);

    const nextIndex = index + digits.length;

    if (nextIndex < CODE_LENGTH) {
      focusInput(nextIndex);
    } else {
      inputRefs.current[CODE_LENGTH - 1]?.blur();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      if (code[index]) {
        const updatedCode = [...code];
        updatedCode[index] = "";
        setCode(updatedCode);
        return;
      }

      if (index > 0) {
        const updatedCode = [...code];
        updatedCode[index - 1] = "";
        setCode(updatedCode);
        focusInput(index - 1);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (
      event.key === "ArrowRight" &&
      index < CODE_LENGTH - 1
    ) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pastedCode) return;

    const updatedCode = Array(CODE_LENGTH).fill("");

    pastedCode.split("").forEach((digit, index) => {
      updatedCode[index] = digit;
    });

    setCode(updatedCode);

    if (pastedCode.length === CODE_LENGTH) {
      inputRefs.current[CODE_LENGTH - 1]?.blur();
    } else {
      focusInput(pastedCode.length);
    }
  };

  const verifyEmail = async () => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }

    if (codeValue.length !== CODE_LENGTH) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }

    const purpose = searchParams.get("purpose");
    const isEmailChange = purpose === "change";

    try {
      setIsVerifying(true);

      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: codeValue,
          purpose: isEmailChange ? "change" : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Verification failed.");
        hasAutoSubmitted.current = false;
        return;
      }

      // ==========================================
      // Email change flow
      // ==========================================

      if (isEmailChange) {
        if (!data.email) {
          toast.error(
            "Email was updated, but the new email was not returned."
          );
          hasAutoSubmitted.current = false;
          return;
        }

        // The user is already logged in.
        // Update the existing NextAuth session instead
        // of signing in again.
        await update({
          email: data.email,
        });

        toast.success("Email updated successfully.");

        router.push("/profile");

        return;
      }

      // ==========================================
      // Normal signup verification flow
      // ==========================================

      if (!data.loginToken) {
        toast.error(
          "Verification succeeded, but login failed."
        );
        hasAutoSubmitted.current = false;
        return;
      }

      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        verificationLoginToken: data.loginToken,
      });

      if (!loginResult?.ok) {
        toast.error(
          "Email verified, but automatic login failed."
        );
        hasAutoSubmitted.current = false;
        return;
      }

      toast.success("Email verified successfully.");

      router.push("/");
    } catch (error) {
      console.error("Verify email error:", error);
      toast.error("Something went wrong. Please try again.");
      hasAutoSubmitted.current = false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (
      codeValue.length === CODE_LENGTH &&
      !hasAutoSubmitted.current
    ) {
      hasAutoSubmitted.current = true;
      verifyEmail();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeValue]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((seconds) =>
        Math.max(0, seconds - 1)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resendCode = async () => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }

    if (resendCooldown > 0) return;

    try {
      setIsResending(true);

      const res = await fetch(
        "/api/auth/send-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message ||
            "Failed to resend verification code."
        );
        return;
      }

      setCode(Array(CODE_LENGTH).fill(""));
      hasAutoSubmitted.current = false;

      focusInput(0);

      setResendCooldown(
        RESEND_COOLDOWN_SECONDS
      );

      toast.success(
        "A new verification code has been sent."
      );
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      toast.error(
        "Failed to resend verification code."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Form Side */}
        <div className="flex w-full items-center justify-center px-5 pt-24 pb-10 sm:px-6 sm:pt-28 sm:pb-12 md:px-8 md:pt-32 lg:px-12 lg:pt-[9rem] lg:pb-12">
          <div className="w-full max-w-[26rem] sm:max-w-[28rem] lg:max-w-[30rem]">

            {/* Heading */}
            <div className="mb-6 flex flex-col items-start gap-3 text-left sm:mb-8 sm:gap-4 lg:mb-10">
              <h1 className="heading-3 text-black">
                Verify Your Email
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                We sent a 6-digit verification code to{" "}
                <span className="font-medium text-black break-all">
                  {email}
                </span>
              </p>
            </div>

            {/* Verification Form */}
            <div className="space-y-5 sm:space-y-6 lg:space-y-7">

              {/* Code Inputs */}
              <div
                className="flex w-full justify-between gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={CODE_LENGTH}
                    value={digit}
                    onChange={(event) =>
                      handleChange(
                        index,
                        event.target.value
                      )
                    }
                    onKeyDown={(event) =>
                      handleKeyDown(index, event)
                    }
                    aria-label={`Verification code digit ${
                      index + 1
                    }`}
                    className="
                      h-[2.75rem]
                      w-full
                      rounded-[0.75rem]
                      border-black/15
                      p-0
                      text-center
                      font-mono
                      text-lg
                      font-medium
                      focus:border-[#ee0a0a]
                      focus:ring-[#ee0a0a]/20
                      sm:h-[3rem]
                      sm:text-xl
                      lg:h-[3.2rem]
                    "
                  />
                ))}
              </div>

              {/* Verify */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={verifyEmail}
                  disabled={
                    isVerifying ||
                    codeValue.length !== CODE_LENGTH
                  }
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {isVerifying ? (
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  ) : (
                    "VERIFY EMAIL"
                  )}
                </button>
              </div>

              {/* Resend */}
              <button
                type="button"
                onClick={resendCode}
                disabled={
                  isResending ||
                  resendCooldown > 0
                }
                className="
                  w-full
                  text-[0.75rem]
                  text-muted-foreground
                  underline
                  transition-colors
                  hover:text-[#ee0a0a]
                  disabled:opacity-50
                  sm:text-[0.8rem]
                  lg:text-[0.825rem]
                "
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend verification code"}
              </button>
            </div>

            {/* Back to Login */}
            <p className="mt-6 text-center text-[0.75rem] uppercase text-muted-foreground sm:mt-8 sm:text-[0.8rem] lg:mt-10 lg:text-[0.825rem]">
              Already verified?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-black underline transition-colors hover:text-[#ee0a0a]"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}