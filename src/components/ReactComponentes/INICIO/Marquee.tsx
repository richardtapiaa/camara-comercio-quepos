import type * as React from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  name: string;
  href: string;
  path: string;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={42} reverse speed={80} speedOnHover={25}>
        {logos.map((logo, i) => (
          <a
            aria-label={logo.name}
            className="text-neutral-500 transition-colors hover:text-sky-600"
            href={logo.href}
            key={`${logo.name}-${i}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" className="h-10 w-10 md:h-14 md:w-14" fill="currentColor" viewBox="0 0 24 24">
              <path d={logo.path} />
            </svg>
          </a>
        ))}
      </InfiniteSlider>
    </div>
  );
}
