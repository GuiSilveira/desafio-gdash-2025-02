/**
 * Hook para scroll por arraste (drag to scroll)
 * Segue SRP: responsável apenas pela lógica de drag-to-scroll
 */

import { useRef, useCallback } from "react";

interface UseDragScrollOptions {
  /** Multiplicador de velocidade do scroll (default: 1.5) */
  speed?: number;
  /** Direção do scroll (default: 'horizontal') */
  direction?: "horizontal" | "vertical";
}

interface UseDragScrollReturn {
  /** Ref para anexar ao elemento scrollável */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Handler para iniciar o drag */
  onMouseDown: (e: React.MouseEvent) => void;
  /** Scroll programático para esquerda/cima */
  scrollBack: (amount?: number) => void;
  /** Scroll programático para direita/baixo */
  scrollForward: (amount?: number) => void;
}

export function useDragScroll({
  speed = 1.5,
  direction = "horizontal",
}: UseDragScrollOptions = {}): UseDragScrollReturn {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const startPos = direction === "horizontal" ? e.pageX : e.pageY;
      const startScroll =
        direction === "horizontal" ? el.scrollLeft : el.scrollTop;
      const offset = direction === "horizontal" ? el.offsetLeft : el.offsetTop;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentPos =
          direction === "horizontal" ? moveEvent.pageX : moveEvent.pageY;
        const diff = currentPos - offset;
        const walk = (diff - (startPos - offset)) * speed;

        if (direction === "horizontal") {
          el.scrollLeft = startScroll - walk;
        } else {
          el.scrollTop = startScroll - walk;
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        el.style.cursor = "grab";
      };

      el.style.cursor = "grabbing";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, speed],
  );

  const scrollBack = useCallback(
    (amount = 200) => {
      if (ref.current) {
        ref.current.scrollBy({
          [direction === "horizontal" ? "left" : "top"]: -amount,
          behavior: "smooth",
        });
      }
    },
    [direction],
  );

  const scrollForward = useCallback(
    (amount = 200) => {
      if (ref.current) {
        ref.current.scrollBy({
          [direction === "horizontal" ? "left" : "top"]: amount,
          behavior: "smooth",
        });
      }
    },
    [direction],
  );

  return {
    ref,
    onMouseDown,
    scrollBack,
    scrollForward,
  };
}
