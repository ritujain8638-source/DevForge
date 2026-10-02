import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ServiceWorkerRegistrar } from "@/components/pwa/sw-register";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-geist-sans",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-display",
    display: "swap",
});

/** Applies the saved theme before first paint so switching themes never flashes. */
const themeInitScript = `(function(){try{var t=localStorage.getItem("devforge-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}})()`;

export const metadata: Metadata = {
    title: {
        default: "DevForge - premier developer community at Newton School of Technology",
        template: "%s | DevForge"
    },
    description: "Join the premier developer community at Newton School of Technology. Learn, build, and forge amazing projects together in a collaborative environment.",
    keywords: ["dev club", "coding", "programming", "technology", "NST", "SVYASA", "hackathon", "development", "student community", "software engineering"],
    authors: [{ name: "DevForge Team" }],
    creator: "DevForge",
    publisher: "DevForge",
    metadataBase: new URL("https://www.devforge.club"),
    openGraph: {
        title: "DevForge - NST x SVYASA",
        description: "Join the premier developer community at Newton School of Technology. Learn, build, and forge amazing projects together.",
        url: "https://www.devforge.club",
        siteName: "DevForge",
        images: [
            {
                url: "/logo.png",
                alt: "DevForge Community",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "DevForge - NST x SVYASA",
        description: "Where ideas are forged into reality. Join the revolution.",
        creator: "@devforge_nst", // Placeholder handle
        images: ["/logo.png"],
    },
    icons: {
        icon: [
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
        // iOS ignores the manifest and needs an opaque square of its own.
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        title: "DevForge",
        statusBarStyle: "black-translucent",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "DevForge",
        "url": "https://www.devforge.club",
        "logo": "https://www.devforge.club/logo.png",
        "sameAs": [
            "https://twitter.com/devforge_nst",
            "https://github.com/devforge-nst",
            "https://linkedin.com/company/devforge-nst"
        ],
        "description": "The premier developer community at Newton School of Technology.",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN"
        }
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased text-white relative`}>
                <SmoothScroll />
                <ServiceWorkerRegistrar />
                <Navbar />
                {children}
                <Footer />
            </body>
        </html>
    );
}
