import type { Metadata } from "next"
import "./globals.css"

const miniappMetadata = {
  version: "1",
  imageUrl: "https://letsconnect-waitlist.vercel.app/opengraph-image",
  button: {
    title: "🚩 Join Waitlist",
    action: {
      type: "launch_frame",
      name: "Let's Connect Waitlist",
      url: "https://letsconnect-waitlist.vercel.app",
      splashImageUrl: "https://letsconnect-waitlist.vercel.app/icon-512.jpg",
      splashBackgroundColor: "#FFFFFF"
    }
  }
}

export const metadata: Metadata = {
  title: "Let's Connect Waitlist",
  description: "Be one of the first 100 to unlock the digital handshake",
  metadataBase: new URL("https://letsconnect-waitlist.vercel.app"),
  openGraph: {
    title: "Let's Connect Waitlist",
    description: "Your social life, one scan away",
    url: "https://letsconnect-waitlist.vercel.app",
    siteName: "Let's Connect",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Let's Connect Waitlist",
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Let's Connect Waitlist",
    description: "Your social life, one scan away",
    images: ["/opengraph-image"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://letsconnect-waitlist.vercel.app/opengraph-image",
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:button:1": "🚩 Join Waitlist",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://letsconnect-waitlist.vercel.app",
    "fc:miniapp": JSON.stringify(miniappMetadata),
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
