import React, { createContext, useContext, useState } from "react";

interface TabsContextProps {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}>{children}</TabsContext.Provider>;
}

export function TabsList({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`tabs-list ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, ...props }: { value: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const { value: current, setValue } = ctx;
  const active = current === value;
  return (
    <button
      className={`tab-trigger ${active ? "active" : ""} ${props.className || ""}`.trim()}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, ...props }: { value: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;
  return (
    <div className={`tab-content ${props.className || ""}`.trim()} {...props}>
      {children}
    </div>
  );
}
