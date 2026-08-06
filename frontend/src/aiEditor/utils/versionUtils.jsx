// Version history ko ChatGPT jaisa auto-titled aur relative-time banane ke liye

export function getVersionTitle(version) {
    // Agar AI summary available hai, usi ko title bana do (thoda trim karke)
    if (version.ai_summary && version.ai_summary.trim()) {
        const summary = version.ai_summary.trim();
        return summary.length > 60 ? summary.slice(0, 60) + "..." : summary;
    }

    // Fallback — jab tak summary na aaye
    return "Dataset Update";
}

export function getRelativeTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}