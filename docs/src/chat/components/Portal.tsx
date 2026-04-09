import { createPortal } from "react-dom";

interface PortalProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

export function Portal({ children, containerRef }: PortalProps) {
  const container = containerRef?.current || document.body;
  return createPortal(children, container);
}
