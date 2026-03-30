import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://62chan.qzz.io").replace(/\/$/, "");

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/mod/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
