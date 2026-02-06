import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalArticle } from "@/modules/marketing/layout/LegalArticle";

export const metadata: Metadata = {
  title: {
    default: "Legal Documents · Turistar",
    template: "%s · Turistar",
  },
  description:
    "Full transparency about how Turistar protects your data and the agreements that govern the product experience.",
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <LegalArticle>{children}</LegalArticle>;
}
