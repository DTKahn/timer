import { useEffect, useState } from 'react';

/** Current time, refreshed every animation frame while `active`. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    let frame = requestAnimationFrame(function loop() {
      setNow(Date.now());
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return now;
}
