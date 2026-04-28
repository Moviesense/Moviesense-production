import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn("block", className)} {...props}>
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
