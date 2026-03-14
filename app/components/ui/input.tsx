import { InputHTMLAttributes, forwardRef, ReactNode, useId } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, disabled, ...props }, ref) => {

    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="space-y-1.5">

        {label && (
          <label
            htmlFor={inputId}
            className="block font-rustic text-sm text-[#3b2a1a]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          {...props}
          className={`
            w-full
            px-4 py-2
            rounded-lg

            bg-[#f5dbb4]
            text-[#3b2a1a]
            placeholder:text-[#3b2a1a]/50

            border
            ${error ? "border-red-600" : "border-[#3b2a1a]/30"}

            focus:border-[#3b2a1a]
            focus:outline-none

            shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]

            disabled:opacity-60
            disabled:cursor-not-allowed

            transition-colors
            duration-150

            ${className}
          `}
        />

        {error && (
          <p className="text-xs text-red-700 font-medium">
            {error}
          </p>
        )}

      </div>
    )
  }
)

Input.displayName = "Input"