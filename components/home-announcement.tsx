"use client"

import { Megaphone, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { ThreadEntity } from "@/lib/entities/thread.entity"

interface HomeAnnouncementProps {
    announcements: ThreadEntity[];
}

export function HomeAnnouncement({ announcements }: HomeAnnouncementProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const isHidden = sessionStorage.getItem("announcements_dismissed");
        if (isHidden === "true") {
            setIsDismissed(true);
        }
        setIsMounted(true);
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        sessionStorage.setItem("announcements_dismissed", "true");
    };

    if (!isMounted || !announcements || announcements.length === 0 || isDismissed) return null;

    return (
        <section className="mb-8 overflow-hidden rounded-xl border border-border/60 bg-accent/5">
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-accent" />

                    <h2 className="text-sm font-semibold text-accent">
                        Pengumuman
                    </h2>
                </div>

                <button
                    onClick={handleDismiss}
                    className="rounded-md p-1 opacity-60 transition-opacity hover:bg-accent/10 hover:opacity-100"
                    title="Sembunyikan"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="divide-y divide-border/40">
                {announcements.map((announcement) => (
                    <Link
                        key={announcement.id}
                        href={`/tlg/thread/${announcement.id}`}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/5"
                    >
                        <div className="min-w-0 flex-1">
                            {announcement.subject && (
                                <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                                    {announcement.subject}
                                </p>
                            )}

                            <p className="line-clamp-1 text-xs text-muted-foreground">
                                {announcement.content}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
