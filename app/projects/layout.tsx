import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Projects",
    description: "Explore the projects DevForge members build, ship, and iterate on together.",
    alternates: {
        canonical: "/projects",
    },
};

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}
