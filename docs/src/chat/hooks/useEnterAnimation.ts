import { useEffect } from "react";

export function useEnterAnimation(
  isOpen: boolean,
  setEntered: React.Dispatch<React.SetStateAction<boolean>>,
) {
  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return;
    }
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen, setEntered]);
}
