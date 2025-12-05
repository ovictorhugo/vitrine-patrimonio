import * as React from "react"

import { cn } from "../../lib"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const DateInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type="date"
        className={cn(
          "flex h-10 w-[160px] rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none   disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950  dark:placeholder:text-neutral-400 ",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
DateInput.displayName = "DataInput"

export { DateInput }
