"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProfileUser } from "@/actions/profile.actions";
import { useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  user: ProfileUser;
};

const isStrongPassword = (password: string) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

export default function ProfileForm({ user }: Props) {
  const { update } = useSession();
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailUpdates, setEmailUpdates] = useState(
    user.emailUpdates ?? false
  );

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword && !isStrongPassword(newPassword)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    if (newPassword && !currentPassword) {
      toast.error(
        "Enter your current password to set a new one."
      );
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          emailUpdates,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "Failed to update profile."
        );
        return;
      }

      // ==========================================
      // Email changed → verification required
      // ==========================================

      if (
        data.requiresEmailVerification &&
        data.email
      ) {
        toast.success(
          "Check your new email for a verification code."
        );

        router.push(
          `/verify-email?email=${encodeURIComponent(
            data.email
          )}&purpose=change`
        );

        return;
      }

      // ==========================================
      // Normal profile update
      // ==========================================

      await update({
        name: data.user?.name ?? name,
        email: data.user?.email ?? email,
      });

      toast.success(
        data.message || "Profile updated."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (
        typeof data.user?.emailUpdates ===
        "boolean"
      ) {
        setEmailUpdates(data.user.emailUpdates);
      }
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <h2 className="mb-5 text-[1.1rem] font-medium sm:mb-6 sm:text-[1.2rem]">
        Personal details
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
      >
        {/* Full name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-[0.7rem] uppercase font-medium text-black/80 tracking-[0.05em]"
          >
            Full name
          </Label>

          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl border-black/10"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[0.7rem] uppercase font-medium text-black/80 tracking-[0.05em]"
          >
            Email
          </Label>

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-black/10"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-[0.7rem] uppercase font-medium text-black/80 tracking-[0.05em]"
          >
            Phone
          </Label>

          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-xl border-black/10"
            required
          />
        </div>

        {/* Email updates */}
        <div className="border-t border-black/10 pt-5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="emailUpdates"
              checked={emailUpdates}
              onCheckedChange={(checked) =>
                setEmailUpdates(checked === true)
              }
              className="mt-0.5 data-[state=checked]:border-[#ee0a0a] data-[state=checked]:bg-[#ee0a0a] data-[state=checked]:text-white"
            />

            <div className="space-y-1">
              <Label
                htmlFor="emailUpdates"
                className="cursor-pointer text-sm font-medium text-black"
              >
                Get email updates
              </Label>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Receive updates about new products,
                discounts, and special offers.
              </p>

              <p className="pt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                {emailUpdates
                  ? "Subscribed"
                  : "Unsubscribed"}
              </p>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="border-t border-black/10 pt-4 sm:pt-5">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-black">
              Change password
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Use at least 8 characters with uppercase,
              lowercase, a number, and a symbol.
            </p>
          </div>

          <div className="space-y-4">
            {/* Current password */}
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-[0.7rem] uppercase font-medium text-black/80 tracking-[0.05em]"
              >
                Current password
              </Label>

              <div className="relative">
                <Input
                  id="currentPassword"
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  className="h-11 rounded-xl border-black/10 pr-11"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#ee0a0a]"
                >
                  {showCurrentPassword ? (
                    <EyeOff
                      size={18}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Eye
                      size={18}
                      strokeWidth={1.5}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-[0.7rem] uppercase font-medium text-black/80 tracking-[0.05em]"
              >
                New password
              </Label>

              <div className="relative">
                <Input
                  id="newPassword"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="h-11 rounded-xl border-black/10 pr-11"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#ee0a0a]"
                >
                  {showNewPassword ? (
                    <EyeOff
                      size={18}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Eye
                      size={18}
                      strokeWidth={1.5}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[0.7rem] uppercase font-medium text-black/80 tracking-[0.05em]"
              >
                Confirm new password
              </Label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="h-11 rounded-xl border-black/10 pr-11"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide new password confirmation"
                      : "Show new password confirmation"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#ee0a0a]"
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={18}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Eye
                      size={18}
                      strokeWidth={1.5}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}