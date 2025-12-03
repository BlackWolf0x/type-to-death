import * as React from "react"

import { cn } from "@/lib/utils"
import { CardRain } from "./card-rain"

interface CardProps extends React.ComponentProps<"div"> {
  disableRain?: boolean;
}

function Card({ className, disableRain = false, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative bg-black text-card-foreground flex flex-col gap-6 rounded-xl border border-red-500/30 py-6 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Rain background */}
      {!disableRain && (
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <CardRain />
        </div>
      )}

      {/* Red corners */}
      <div className="pointer-events-none absolute left-1 top-1 z-10 size-10 rounded-tl-lg border-l-2 border-t-2 border-red-600" />
      <div className="pointer-events-none absolute right-1 top-1 z-10 size-10 rounded-tr-lg border-r-2 border-t-2 border-red-600" />
      <div className="pointer-events-none absolute bottom-1 left-1 z-10 size-10 rounded-bl-lg border-b-2 border-l-2 border-red-600" />
      <div className="pointer-events-none absolute bottom-1 right-1 z-10 size-10 rounded-br-lg border-b-2 border-r-2 border-red-600" />

      {/* Content wrapper with z-index */}
      <div className="relative z-10">
        {props.children}
      </div>
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
