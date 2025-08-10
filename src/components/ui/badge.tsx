import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string;
}

export function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span className={`badge ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
