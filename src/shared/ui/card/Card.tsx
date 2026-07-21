import Link from "next/link";
import { cn } from "@/shared/utils/cn";

type CardProps = {
  href: string;
  title: string;
  image?: string;
  className?: string;
};

export function Card({ href, title, image, className }: CardProps) {
  const isPrepared = image && (image.includes("url(") || image.startsWith("linear-gradient"));
  // Quoted so characters CSS treats specially in bare url() — e.g. the ")" in
  // Wikimedia filenames like "Rome Skyline (8012016319).jpg" — can't end it early.
  const bg = image
    ? isPrepared
      ? image
      : `url("${image.replace(/"/g, '\\"')}")`
    : "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)";

  return (
    <Link
      href={href}
      className={cn(
        "group border-border bg-card block w-full overflow-hidden rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        className
      )}>
      <div
        className="relative h-32 w-full"
        style={{
          backgroundImage: bg,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="px-3 py-2">
        <p className="truncate text-sm font-semibold">{title}</p>
      </div>
    </Link>
  );
}
