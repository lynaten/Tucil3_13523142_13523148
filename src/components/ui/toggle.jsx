"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-blue-500/10 data-[state=on]:text-blue-500 data-[state=on]:border-blue-500 border border-input hover:border-blue-500 dark:data-[state=on]:bg-blue-500/10 dark:data-[state=on]:text-blue-500 dark:hover:border-blue-500 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
	{
		variants: {
			variant: {
				default:
					"bg-transparent hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-500",
				outline:
					"border border-input bg-transparent shadow-xs hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-500 dark:hover:border-blue-500",
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
