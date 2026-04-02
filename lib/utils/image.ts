/**
 * Generates an optimized thumbnail URL using Cloudinary.
 * Default: 250x250, auto quality and format.
 */
export function getThumbnailUrl(
    url: string | null | undefined,
    width = 250,
    height = 250,
    mode: 'fill' | 'fit' | 'pad' | 'crop' | 'scale' = 'fill',
    staticGif = false
): string {
    if (!url) return "/placeholder.svg";

    // Handle Cloudinary (Priority)
    if (url.includes("cloudinary.com")) {
        const isGif = url.toLowerCase().endsWith(".gif");
        const parts = url.split("/upload/");
        if (parts.length < 2) return url;

        const base = parts.slice(0, -1).join("/upload/");
        const rest = parts[parts.length - 1];

        // Cloudinary specific transformation mapping
        const hasGravity = ["fill", "thumb", "crop"].includes(mode);
        const transformations = [
            `c_${mode === 'scale' ? 'scale' : mode}`,
            `w_${width}`,
            height ? `h_${height}` : "",
            hasGravity ? "g_auto" : "",
            "q_auto",
            "f_auto",
            (staticGif && isGif) ? "pg_1" : ""
        ].filter(Boolean).join(",");

        return `${base}/upload/${transformations}/${rest}`;
    }

    // Default: return raw URL if it's not a Cloudinary URL
    return url;
}

/**
 * Generates a lower quality/smaller version for feed display
 */
export function getFeedImageUrl(url: string | null | undefined, width = 450): string {
    return getThumbnailUrl(url, width, 0, 'scale');
}
