import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground border-foreground/20 border-2 border-b-4 active:border-b-2 hover:bg-foreground/5",

        // custom
        locked:
          "bg-foreground/10 text-foreground hover:bg-foreground/20 border-foreground/25 border-b-4 active:border-b-0",

        primary:
          "bg-duo-blue text-white hover:bg-duo-blue/90 border-duo-blue/80 border-b-4 active:border-b-0",
        primaryOutline:
          "bg-background text-duo-blue hover:bg-foreground/5",

        secondary:
          "bg-duo-green text-white hover:bg-duo-green/90 border-duo-green-dark border-b-4 active:border-b-0",
        secondaryOutline:
          "bg-background text-duo-green hover:bg-foreground/5",

        tertiary:
          "bg-duo-red text-white hover:bg-duo-red/90 border-duo-red/80 border-b-4 active:border-b-0",

        danger:
          "bg-duo-red text-white hover:bg-duo-red/90 border-duo-red/80 border-b-4 active:border-b-0",
        dangerOutline:
          "bg-background text-duo-red hover:bg-foreground/5",

        super:
          "bg-duo-purple text-white hover:bg-duo-purple/90 border-duo-purple/80 border-b-4 active:border-b-0",
        superOutline:
          "bg-background text-duo-purple hover:bg-foreground/5",

        ghost:
          "bg-transparent text-foreground/50 border-transparent border-0 hover:bg-foreground/5",

        sidebar:
          "bg-transparent text-foreground/50 border-2 border-transparent hover:bg-foreground/5 transition-none",
        sidebarOutline:
          "bg-duo-blue/15 text-duo-blue border-duo-blue/40 border-2 hover:bg-duo-blue/20 transition-none",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",

        // custom
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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