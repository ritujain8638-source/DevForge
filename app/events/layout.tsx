import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Explore and participate in upcoming community events and workshops.",
  alternates: {
    canonical: "/events",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}