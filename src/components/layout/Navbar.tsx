"use client";

import Link from "next/link";
import { Music } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Music size={20} className="text-primary" />
          <span>Music Roadmap</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Roadmaps
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
