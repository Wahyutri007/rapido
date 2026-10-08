import { useEffect, useRef } from "react";

/**
 * @description Runs a callback exactly once when the component mounts.
 * Intentionally has no dependency array — mount-only by design.
 * If you're tempted to pass dependencies, use a plain `useEffect` instead.
 * @param fn The callback to run on mount. May return a cleanup function.
 */
export default function useOnMount(fn: () => void | (() => void)) {
  const ref = useRef(fn);

  useEffect(() => {
    const cleanup = ref.current();
    return typeof cleanup === "function" ? cleanup : undefined;
    // Mount-only by design — intentionally omitted from deps.
    // The ref guarantees the latest callback is invoked.
  }, []);
}
