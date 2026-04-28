import { formatViews } from "@/lib/utils";
import { Eye } from "lucide-react";

export function Views({ view }: { view: number | string }) {
  return (
    <span className="text-neutral-400 flex items-center gap-1">
      <Eye size={16} />
      {formatViews(view)}
    </span>
  );
}
