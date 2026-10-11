import { useEffect, useRef } from "react";

type Mount = (container: HTMLElement) => void | (() => void);

/**
 * Jembatan untuk menampilkan modul vanilla JS di dalam pohon React.
 * `mount` dipanggil sekali saat komponen terpasang, hasilnya dipakai sebagai cleanup.
 */
export function VanillaMount({
  mount,
  className,
}: {
  mount: Mount;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mountRef = useRef(mount);
  mountRef.current = mount;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanup = mountRef.current(el);
    return () => {
      if (typeof cleanup === "function") cleanup();
      el.replaceChildren();
    };
  }, []);

  return <div ref={ref} className={className} />;
}
