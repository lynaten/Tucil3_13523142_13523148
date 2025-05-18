"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-black/10 data-[state=on]:text-black data-[state=on]:border-black border border-input hover:border-black dark:data-[state=on]:bg-white/10 dark:data-[state=on]:text-white dark:hover:border-white aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
	{
		variants: {
			variant: {
				default:
					"bg-transparent hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white",
				outline:
					"border border-input bg-transparent shadow-xs hover:bg-black/10 hover:text-black hover:border-black dark:hover:bg-white/10 dark:hover:text-white dark:hover:border-white",
			},
			size: {
				default: "h-11 px-2 min-w-11",
				sm: "h-10 px-1.5 min-w-10",
				lg: "h-12 px-2.5 min-w-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Toggle({ className, variant, size, ...props }) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			className={cn(toggleVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Toggle, toggleVariants };
