import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Care2Connect",
  description:
    "View your housing stability assessment results, personalized roadmap, and priority ranking.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
