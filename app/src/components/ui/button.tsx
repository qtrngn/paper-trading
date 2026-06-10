import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-primary text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-brand-foreground hover:bg-brand-hover",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",

        outline:
          "border border-border-soft bg-transparent text-text-primary hover:bg-surface-elevated",

        ghost:
          "bg-transparent text-text-muted hover:text-text-primary",

        muted:
          "bg-surface-elevated text-text-secondary hover:bg-surface-muted hover:text-text-primary",

        destructive:
          "bg-danger-strong text-white hover:bg-danger-strong/90 focus-visible:ring-danger/30",

        link:
          "h-auto rounded-none p-0 text-text-secondary underline-offset-4 hover:text-text-primary hover:underline",

        buy:
          "bg-brand text-brand-foreground hover:bg-brand-hover",

        sell:
          "bg-danger-strong text-white hover:bg-danger-strong/90",
      },

      size: {
        default:
          "h-10 px-4 py-2 has-[>svg]:px-3",

        xs:
          "h-7 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-8 gap-1.5 rounded-lg px-3 text-sm has-[>svg]:px-2.5",

        lg:
          "h-11 rounded-xl px-6 text-base has-[>svg]:px-4",

        icon:
          "size-10",

        "icon-xs":
          "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-8 rounded-lg",

        "icon-lg":
          "size-11 rounded-xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }