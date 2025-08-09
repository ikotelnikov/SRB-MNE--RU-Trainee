import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string;
}

export function Badge({ children, ...props }: BadgeProps) {
  return <span {...props}>{children}</span>;
}
