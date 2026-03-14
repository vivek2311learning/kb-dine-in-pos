import { HTMLAttributes, ReactNode } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: "wood" | "outline" | "ghost"
  padding?: "sm" | "md" | "lg"
  hover?: boolean
}

export function Card({
  children,
  className = "",
  variant = "wood",
  padding = "md",
  hover = true,
  ...props
}: CardProps) {

  const variants = {
    wood: `
      bg-[url('/textures/wood.png')]
      bg-cover
      bg-center
      shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-3px_5px_rgba(0,0,0,0.35),0_6px_10px_rgba(0,0,0,0.4)]
    `,
    outline: `
      border
      border-[#3b2a1a]/20
      bg-white
      shadow-sm
    `,
    ghost: `
      bg-[#f5f2ee]
    `
  }

  const paddings = {
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  }

  return (
    <div
      {...props}
      className={`
        relative
        rounded-xl
        text-[#3b2a1a]

        ${variants[variant]}
        ${paddings[padding]}

        ${hover ? "transition-transform duration-200 hover:-translate-y-1" : ""}

        ${className}
      `}
    >
      {children}
    </div>
  )
}