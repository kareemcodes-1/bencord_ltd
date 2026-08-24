"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { PageHeader } from "@/app/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import {
  getAdminProfile,
  updateAdminProfile,
  deleteAdminAccount,
  type UpdateProfilePayload,
} from "@/actions/admin/profile.actions";

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { update } = useSession();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
  });

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  React.useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateAdminProfile(data),
    onSuccess: async (updatedProfile) => {
      // Refresh React Query cache
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });

      // Update NextAuth session so sidebar/header update immediately
      await update({
        name: updatedProfile.name,
        email: updatedProfile.email,
      });

      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminAccount,
    onSuccess: async () => {
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/admin/login" });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });
  };

  const isSaving = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <main className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <PageHeader
          title="Account"
          description="Manage your personal information and account settings."
        />

        {/* Profile Form */}
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
            <CardDescription>
              Update your name, email and phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 55 000 0000"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving} size="lg">
                    {isSaving && (
                      <Loader2Icon className="size-4 animate-spin" />
                    )}
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="max-w-xl border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>
              Permanently delete your admin account. This action cannot be
              undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2Icon className="size-4" />
                  Delete account
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your admin account. You will be
                    logged out immediately and will no longer be able to access
                    the admin panel.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, delete my account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}