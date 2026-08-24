import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Categories",
    description:
        "Manage your categories and organize your products.",
};

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}