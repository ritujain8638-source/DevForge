import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Change password",
    robots: {
        index: false,
    },
};

export default function ChangePasswordLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}