import { ChevronRight, Pin } from "lucide-react"
import Link from "next/link"
import type { ThreadEntity } from "@/lib/entities/thread.entity"

interface HomeAnnouncementProps {
    announcement: ThreadEntity | null;
}

export function HomeAnnouncement({ announcement }: HomeAnnouncementProps) {
    if (!announcement) return null;

    return (
        <section className="mb-8">
            <Link
                href={`/tlg/thread/${announcement.id}`}
                className="block bg-accent/5 border-border hover:bg-accent/10 hover:border-accent/30 border text-foreground p-4 rounded-lg flex items-start gap-4 transition-colors shadow-sm relative overflow-hidden group"
            >

                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-sm sm:text-base leading-none text-accent">
                            {announcement.subject || "Pengumuman"}
                        </h3>
                    </div>

                    <p className="text-[13px] sm:text-sm text-muted-foreground line-clamp-2 md:line-clamp-1 leading-relaxed">
                        {announcement.content}
                    </p>
                </div>

                <div className="hidden sm:flex shrink-0 text-accent/50 group-hover:text-accent translate-x-2 group-hover:translate-x-0 transition-all h-full items-center my-auto">
                    <ChevronRight className="w-5 h-5" />
                </div>
            </Link>
        </section>
    )
}
