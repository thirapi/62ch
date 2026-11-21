"use client"

import { IntentLink as Link } from "@/components/intent-link"
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
        <section className="ib-box mb-3">
            <div className="ib-infobox-bar">
                <h2>Pengumuman</h2>
                <button
                    onClick={handleDismiss}
                    className="font-mono text-xs font-normal opacity-80 hover:opacity-100"
                    title="Sembunyikan"
                >
                    [×]
                </button>
            </div>

            <ul className="divide-y divide-ib-hr px-2 text-[13px]">
                {announcements.map((announcement) => (
                    <li key={announcement.id} className="py-1.5">
                        <Link href={`/tlg/thread/${announcement.id}`} className="group block">
                            {announcement.subject && (
                                <span className="ib-subject mr-1 group-hover:underline">{announcement.subject}</span>
                            )}
                            <span className="line-clamp-3 sm:line-clamp-2 text-foreground/90">
                                {announcement.content}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
