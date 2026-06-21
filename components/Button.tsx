import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-buttons text-[15px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-midnight-ink text-parchment-white border border-ash-border px-4 py-2.5 hover:bg-driftwood",
        secondary: "bg-parchment-white text-midnight-ink border border-ash-border px-3 py-2.5 shadow-subtle-2 hover:bg-warm-sand",
        ghost: "bg-transparent text-midnight-ink hover:bg-driftwood/10",
      },
      size: {
        sm: "h-9 px-3 text-[14px]",
        md: "h-10 text-[15px]",
        lg: "h-11 px-5 text-[16px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
