import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  size?: string;
}

export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
