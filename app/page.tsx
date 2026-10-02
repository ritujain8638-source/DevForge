import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { HeroEditorial } from "@/components/home/hero-editorial";

const TheRecord = dynamic(() => import("@/components/home/the-record").then((m) => m.TheRecord));
const Chapters = dynamic(() => import("@/components/home/chapters").then((m) => m.Chapters));
const TheWall = dynamic(() => import("@/components/home/the-wall").then((m) => m.TheWall));
const Voices = dynamic(() => import("@/components/home/voices").then((m) => m.Voices));
const Closing = dynamic(() => import("@/components/home/closing").then((m) => m.Closing));

export const metadata: Metadata = {
    alternates: {
        canonical: "/",
    },
};
export default function Home() {
    return (
        <main className="bg-transparent text-white">
            <HeroEditorial />
            <TheRecord />
            <Chapters />
            <TheWall />
            <Voices />
            <Closing />
        </main>
    );
}
