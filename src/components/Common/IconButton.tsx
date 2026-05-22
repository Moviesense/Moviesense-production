import { cn } from "@/lib/utils";

interface IconButtonProps {
  children: React.ReactNode;
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  totalLikes?: number | string;
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
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 group/btn",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
      }}
    >
      <span
        className={cn(
          "border-gradient h-[28px] w-[28px] flex justify-center items-center rounded-full text-white shadow-none disabled:opacity-50 transition-colors",
          onClick ? "cursor-pointer" : "cursor-default",
          className,
        )}
      >
        {children}
      </span>
      {totalLikes !== undefined && totalLikes !== null && totalLikes !== 0 && (
        <span className="text-white text-[14px] font-bold">{totalLikes}</span>
      )}
      {title && (
        <span className="font-medium text-[12px] sm:text-[14px] text-neutral-300">
          {title}
        </span>
      )}
    </span>
  );
}
