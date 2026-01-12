import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-2 text-sm transition-colors placeholder:text-[#57606a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0969da] focus-visible:border-[#0969da] focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
