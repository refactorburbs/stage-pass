import { ReactNode } from "react";

interface TooltipHoverProps {
  text: string;
  children: ReactNode;
}

export default function TooltipHover ({ text, children }: TooltipHoverProps) {
  return (
    <span title={text}>
      {children}
    </span>
  );
}