import { cn } from "@/lib/utils";

interface IconButtonProps {
  children: React.ReactNode;
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  totalLikes?: number;
}

export function IconButton({
  children,
  title,
  onClick,
  disabled,
  className,
  totalLikes,
}: IconButtonProps) {
  return (
    <span
      className="flex items-center gap-2 group/btn cursor-pointer"
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
      }}
    >
      <span
        className={cn(
          "border-gradient h-[28px] w-[28px] flex justify-center items-center cursor-pointer rounded-full text-white shadow-none disabled:opacity-50 transition-colors",
          className,
        )}
      >
        {children}
      </span>
      {totalLikes !== undefined && totalLikes > 0 && (
        <span className="text-white text-xs font-bold">{totalLikes}</span>
      )}
      {title && (
        <span className="font-medium text-[10px] sm:text-xs text-neutral-300">
          {title}
        </span>
      )}
    </span>
  );
}
