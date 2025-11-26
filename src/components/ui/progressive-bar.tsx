import { cn } from "@/lib/utils";


export interface ProgressiveBarProps {
    progress: number;
}

export const ProgressiveBar = ({ progress, className }: React.ComponentProps<"button"> & ProgressiveBarProps) => {
    return (
        <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
            <div className="h-2 rounded-full bg-gray-600" style={{ width: `${progress}%` }}></div>
        </div>
    );
}
