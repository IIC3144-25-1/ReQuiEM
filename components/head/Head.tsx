import { ReactNode } from "react";

export function Head({title="", components} : {title: string; components: ReactNode[]}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between my-2 w-full">
      <span className="leading-none font-semibold text-2xl px-6 py-2 mb-2 sm:mb-0">{title}</span>
      <div className="flex flex-col sm:flex-row gap-4 items-center px-2 sm:px-6">
        {components.map((component, index) => (
          <div className="w-full sm:w-auto" key={index}>{component}</div>
        ))}
      </div>
    </div>
  )
}
  