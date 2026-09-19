import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ui-action inline-flex items-center justify-center gap-2 rounded-full border border-solid text-[length:var(--text-small)] font-medium no-underline cursor-pointer transition-[color,background-color,border-color,transform,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:brightness-110",
        outline: "border-input bg-transparent text-foreground hover:bg-accent",
        secondary: "border-border bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-accent",
        link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-6 py-2",
        sm: "min-h-11 px-4 py-2 text-sm",
        lg: "min-h-14 px-8 py-3",
        icon: "size-11 shrink-0 p-2",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...(!asChild ? { type: "button" as const } : {})}
      {...props}
    />
  );
}

export { Button, buttonVariants };
