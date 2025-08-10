import React from "react";

export function Progress({ value = 0 }: { value?: number }) {
  return (
    <div className="progress">
      <div className="progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}
