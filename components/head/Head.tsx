import { ReactNode } from "react";

export function Head({
  title,
  description,
  components,
}: {
  title: string;
  description?: string; // Optional in the type
  components: ReactNode[];
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between my-4 gap-4 w-full">
      <div>
        <h3 className="leading-none font-semibold text-2xl py-2 ">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center px-2 sm:px-6">
        {components.map((component, index) => (
          <div className="w-full sm:w-auto" key={index}>
            {component}
          </div>
        ))}
      </div>
    </div>
  );
}