import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AFTERLIGHT — The missions ended. The stories didn't.",
    template: "%s · AFTERLIGHT",
  },
  description:
    "An interactive 3D expedition through the machines humanity left on the Moon and Mars: their missions, their final days, and the science they made possible.",
  keywords: [
    "Moon",
    "Mars",
    "NASA",
    "rovers",
    "landers",
    "space exploration",
    "3D",
    "education",
    "Apollo",
  ],
  authors: [{ name: "AFTERLIGHT" }],
  openGraph: {
    title: "AFTERLIGHT — The missions ended. The stories didn't.",
    description:
      "Explore the hardware left on the Moon and Mars, with credited mission evidence and educational 3D reconstructions.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#04070f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (password managers, timers, screen recorders) inject attributes such as
    // `one-sec-browser-extension-id` into <html> before React hydrates. That is not an app mismatch,
    // and suppressHydrationWarning only silences attribute warnings on these two elements.
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
