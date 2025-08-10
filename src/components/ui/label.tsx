import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <label className={`label ${className}`.trim()} {...props}>
      {children}
    </label>
  );
}
