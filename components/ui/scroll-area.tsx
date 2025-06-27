"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

type ScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  scrollToLabelId?: string
}

function ScrollArea({
  className,
  children,
  scrollToLabelId,
  ...props
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [fadeWidth, setFadeWidth] = React.useState(20);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function handleScroll() {
      if (!viewport) return;
      const { scrollLeft, scrollWidth, clientWidth } = viewport;
      const remaining = scrollWidth - (scrollLeft + clientWidth);
      // El gradiente se achica cuando te acercas al borde derecho
      // (puedes ajustar el factor según tu gusto)
      if (remaining < 20) {
        setFadeWidth(Math.max(remaining, 0));
      } else {
        setFadeWidth(20);
      }
    }

    viewport.addEventListener("scroll", handleScroll);
    // Llama una vez para iniciar el estado
    handleScroll();

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, []);

  React.useEffect(() => {
    if (scrollToLabelId && viewportRef.current) {
      const target = viewportRef.current.querySelector(`#${scrollToLabelId}`);
      if (target && target instanceof HTMLElement) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [scrollToLabelId]);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
      <div
        className="absolute w-5 sm:w-0 right-0 top-0 h-full bg-linear-to-r to-primary/10 pointer-events-nonel"
        style={{
          width: `${fadeWidth}px`,
          minWidth: 0,
          maxWidth: 20,
          transition: "width 0.15s",
        }}
      />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
