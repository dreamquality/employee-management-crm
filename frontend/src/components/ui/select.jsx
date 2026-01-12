import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1 text-sm transition-colors placeholder:text-[#57606a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0969da] focus-visible:border-[#0969da] focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57606a] pointer-events-none" />
    </div>
  )
})
Select.displayName = "Select"

export { Select }
