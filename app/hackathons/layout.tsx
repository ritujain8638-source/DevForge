import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hackathons",
    description:
        "Explore hackathon winners and discover the projects and achievements of the DevForge community.",
    alternates: {
        canonical: "/hackathons",
    },
};

export default function HackathonsLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return children;
}


