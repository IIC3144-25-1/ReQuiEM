"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import getInitials from "@/utils/initials"
import { TailwindColor, colorMap, isTailwindColor } from "@/utils/colors"

import { cn } from "@/lib/utils"

function StrAvatar({ color="gray", name, className } : { color: TailwindColor, name: string, className?: string }) {
  const tColor = isTailwindColor(color) ? color : 'gray'
  return (
    <Avatar
      className={cn(colorMap[tColor], className)}
    >
      {getInitials(name)}
    </Avatar>
  )
}

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full items-center justify-center border',
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { StrAvatar, Avatar, AvatarImage, AvatarFallback }
