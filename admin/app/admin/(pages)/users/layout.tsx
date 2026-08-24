import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description:
    "Manage users, customer accounts, and user information.",
};

export default function UsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}