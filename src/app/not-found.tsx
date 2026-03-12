import Link from "next/link";
import { Music } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Music size={32} className="text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">
        Roadmap Not Found
      </h2>
      <p className="mt-2 text-muted-foreground">
        The roadmap you&apos;re looking for doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Browse All Roadmaps
      </Link>
    </div>
  );
}
