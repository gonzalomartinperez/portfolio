import type { ComponentProps } from "react";
import { cn } from "@/shared/styles/cn";

function Label({
  className,
  htmlFor,
  children,
  ...props
}: ComponentProps<"label"> & { htmlFor: string }) {
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cn("text-sm font-medium leading-snug", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export { Label };
