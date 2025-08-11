import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium  transition-colors hover:bg-neutral-100  focus-visible:outline-none f disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-neutral-200  dark:hover:bg-neutral-800   dark:data-[state=on]:bg-neutral-600 dark:data-[state=on]:text-slate-50",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-neutral-200 bg-transparent hover:bg-neutral-100  dark:border-neutral-800 dark:hover:bg-neutral-700 ",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
