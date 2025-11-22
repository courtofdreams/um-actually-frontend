export type Stance = "partial" | "mostly" | "opposite" | "undefined";

export type StanceBadgeProps = {
    stance: Stance;
};

const STANCE_CONFIG: Record<
    Stance,
    { label: string; border: string; text: string; icon: string }
> = {
    partial: {
        label: "Partial Support",
        border: "border-orange-400",
        text: "text-orange-500",
        icon: "text-orange-400",
    },
    mostly: {
        label: "Mostly Support",
        border: "border-green-400",
        text: "text-green-500",
        icon: "text-green-400",
    },
    opposite: {
        label: "Opposite",
        border: "border-red-400",
        text: "text-red-500",
        icon: "text-red-400",
    },
    undefined: {
        label: "Undefined",
        border: "border-gray-400",
        text: "text-gray-500",
        icon: "text-gray-400",
    },
};

const StanceBadge = ({ stance }: StanceBadgeProps) => {
    console.log("StanceBadge stance:", stance);
    const cfg = STANCE_CONFIG[stance];

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${cfg.border} ${cfg.text}`}
        >
            <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border bg-white text-xs ${cfg.border} ${cfg.icon}`}
            >
                {stance === "partial" && "✗✓"}
                {stance === "mostly" && "🤝"}
                {stance === "opposite" && (
                    <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M9 8l-4 4 4 4m6-8 4 4-4 4"
                        />
                    </svg>
                )}
            </span>

            <span>{cfg.label}</span>
        </div>
    );
}


export default StanceBadge;