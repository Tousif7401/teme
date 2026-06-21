"use client";

import React, { createContext, useContext } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{
  selectedTab: string;
  setSelectedTab: (value: string) => void;
}>({
  selectedTab: "",
  setSelectedTab: () => {},
});

const tabVariants = cva(
  "inline-flex items-center justify-center rounded-badges px-3 py-2 text-[14px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      state: {
        active: "bg-white shadow-subtle text-midnight-ink",
        inactive: "bg-transparent text-driftwood hover:text-midnight-ink hover:bg-warm-sand/50",
      },
    },
    defaultVariants: {
      state: "inactive",
    },
  }
);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value: controlledValue, onValueChange, children, className }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);

    const selectedTab = controlledValue ?? uncontrolledValue;
    const setSelectedTab = (value: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(value);
      }
      onValueChange?.(value);
    };

    return (
      <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
        <div ref={ref} className={className}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex gap-1 rounded-tabs bg-warm-sand p-1",
        className
      )}
      {...props}
    />
  );
});

TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabVariants> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { selectedTab, setSelectedTab } = useContext(TabsContext);
    const isActive = selectedTab === value;

    return (
      <button
        ref={ref}
        className={cn(
          tabVariants({ state: isActive ? "active" : "inactive" }),
          className
        )}
        onClick={() => setSelectedTab(value)}
        {...props}
      />
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  { value: string } & React.HTMLAttributes<HTMLDivElement>
>(({ className, value, children, ...props }, ref) => {
  const { selectedTab } = useContext(TabsContext);

  if (selectedTab !== value) return null;

  return (
    <div
      ref={ref}
      className={cn("mt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
});

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
