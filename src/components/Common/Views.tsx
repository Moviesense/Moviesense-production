import { formatViews } from "@/lib/utils";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewsProps {
  view: number | string;
  className?: string;
}

export function Views({ view, className }: ViewsProps) {
  return (
    <span className={cn("text-neutral-400 flex items-center gap-1", className)}>
      <Eye size={16} />
      {formatViews(view)}
    </span>
  );
}
